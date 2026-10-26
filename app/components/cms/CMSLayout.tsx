"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import {
  FiChevronRight,
  FiMenu,
  FiChevronsLeft,
  FiChevronsRight,
  FiSearch,
  FiBell,
  FiLogOut,
  FiLock,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { RingLoader } from "react-spinners";
import { usePageTitle } from "../../lib/PageTitelCmsContext";
import {
  FetchData,
  buildApiUrl,
  formatDateTimeIndo,
  GetDecrypt,
  GetEncrypt,
  startCmsNavigationLoading,
  stopCmsNavigationLoading,
} from "../../lib/helper";
import { useDecryptedLoginState } from "../../lib/authUtils";
import { useDispatch, useSelector } from "react-redux";
import { setLocal } from "app/lib/redux/counterSlice";
import {
  AUTH_REMEMBER_KEY,
  clearStoredAuthSession,
  saveAuthSession,
} from "app/lib/authSession";
import NodeCache from "node-cache";
type MenuItem = {
  id: string;
  title: string;
  slug?: string;
  icon?: string;
  children?: MenuItem[];
  isFe?: boolean;
};

type SidebarItemProps = {
  item: MenuItem;
  isCollapsed: boolean;
  depth: number;
  isOpen: boolean;
  openMenus: string[];
  pathname: string;
  currentPath: string;
  searchKeyword: string;
  loadingMenuId: string | null;
  setLoadingMenuId: (id: string | null) => void;
  setIsNavigating: (state: boolean) => void;
  onToggleMenu: (id: string) => void;
  onExpandSidebar: () => void;
  onNavigate?: () => void;
};

type HoveredFlyout = {
  depth: number;
  title: string;
  items: MenuItem[];
  left: number;
  top: number;
};

type RedmineNotificationItem = {
  id: string;
  type: "comment_on_my_task" | "mention" | "new_task";
  title: string;
  message: string;
  actorName: string;
  createdAt?: string | null;
  projectId?: number | null;
  projectName?: string;
  taskId?: number | null;
  taskRedmineId?: number | null;
  link: string;
};

type NotificationFilter = "all" | "mention" | "comment_on_my_task" | "new_task";
const SIDEBAR_SCROLL_STORAGE_KEY = "cms-sidebar-scroll-top";
const SIDEBAR_OPEN_MENUS_STORAGE_KEY = "cms-sidebar-open-menus";
const SIDEBAR_MENU_CACHE_KEY = "cms-sidebar-menu-cache";
const SIDEBAR_MENU_CACHE_TTL_MS = 10_000;
const SIDEBAR_PIN_STORAGE_KEY = "cms-sidebar-pinned";
const FLYOUT_HIDE_DELAY_MS = 2000;

function sortQueryString(queryString: string) {
  const params = new URLSearchParams(queryString);
  const pairs = Array.from(params.entries()).sort(([aKey, aValue], [bKey, bValue]) => {
    if (aKey === bKey) return aValue.localeCompare(bValue);
    return aKey.localeCompare(bKey);
  });
  return pairs
    .map(
      ([key, value]) => `${encodeURIComponent(key.toLowerCase())}=${encodeURIComponent(value.toLowerCase())}`
    )
    .join("&");
}

function normalizeMenuPath(path: string, isFe: boolean) {
  const raw = String(path || "").trim();
  const [baseRaw, queryRaw = ""] = raw.replace(/^\//, "").split("?");
  const normalizedBase =
    "/" +
    baseRaw
      .replace(/^\//, "")
      .split(/[?#]/)[0]
      .replace(/\/(list|form)(\/)?$/, "")
      .replace(/\/$/, "")
      .toLowerCase();

  if (!isFe) return normalizedBase;

  const normalizedQuery = sortQueryString(queryRaw);
  return normalizedQuery ? `${normalizedBase}?${normalizedQuery}` : normalizedBase;
}

function normalizeNavigationPath(path: string, isFe: boolean) {
  const raw = String(path || "").trim();
  const [baseRaw, queryRaw = ""] = raw.replace(/^\//, "").split("?");
  const normalizedBase =
    "/" +
    baseRaw
      .replace(/^\//, "")
      .split(/[?#]/)[0]
      .replace(/\/$/, "")
      .toLowerCase();
  const normalizedQuery = sortQueryString(queryRaw);

  if (!isFe) {
    return normalizedQuery ? `${normalizedBase}?${normalizedQuery}` : normalizedBase;
  }

  return normalizedQuery ? `${normalizedBase}?${normalizedQuery}` : normalizedBase;
}

function splitNormalizedPath(path: string) {
  const [base, query = ""] = String(path || "").split("?");
  return {
    base: base || "/",
    query,
  };
}

function getSidebarActivePathCandidates(currentPath: string) {
  const normalized = normalizeMenuPath(currentPath, false);
  const candidates = new Set<string>([normalized]);
  const { base, query } = splitNormalizedPath(normalized);

  const addCandidate = (value: string) => {
    const normalizedCandidate = normalizeMenuPath(value, false);
    candidates.add(normalizedCandidate);
    if (query) {
      candidates.add(`${normalizedCandidate}?${query}`);
    }
  };

  const isRedmineMonitorChild =
    base === "/cms/redmine/project/on-track" ||
    base === "/cms/redmine/project/delay" ||
    base === "/cms/redmine/project/on-hold" ||
    base.startsWith("/cms/redmine/project/view/") ||
    base.startsWith("/cms/redmine/project-manager");

  if (isRedmineMonitorChild) {
    addCandidate("/cms/redmine/dashboard");
  }

  return Array.from(candidates);
}

function isMenuPathActive(item: MenuItem, currentPath: string) {
  if (!item.slug || item.slug === "#") return false;

  const itemPath = normalizeMenuPath(item.slug || "", !!item.isFe);
  const target = splitNormalizedPath(itemPath);

  return getSidebarActivePathCandidates(currentPath).some((candidate) => {
    const current = splitNormalizedPath(candidate);
    const isBaseMatch =
      current.base === target.base ||
      current.base.startsWith(target.base === "/" ? "/" : `${target.base}/`);

    if (!isBaseMatch) return false;
    if (!item.isFe) return true;
    if (!target.query) return true;
    return current.query === target.query;
  });
}

function isMenuOrDescendantActive(
  item: MenuItem,
  currentPath: string
): boolean {
  const isSelfActive = isMenuPathActive(item, currentPath);

  if (isSelfActive) return true;

  return Boolean(
    item.children?.some((child) => isMenuOrDescendantActive(child, currentPath))
  );
}

function findActiveMenuTrail(
  items: MenuItem[],
  currentPath: string,
  ancestors: MenuItem[] = []
): MenuItem[] {
  for (const item of items || []) {
    const nextAncestors = [...ancestors, item];

    if (item.children?.length) {
      const nestedTrail = findActiveMenuTrail(item.children, currentPath, nextAncestors);
      if (nestedTrail.length) return nestedTrail;
    }

    if (isMenuPathActive(item, currentPath)) {
      return ancestors;
    }
  }

  return [];
}

function findMenuTrailById(
  items: MenuItem[],
  targetId: string,
  ancestors: MenuItem[] = []
): MenuItem[] {
  for (const item of items || []) {
    if (String(item.id) === String(targetId)) {
      return [...ancestors, item];
    }

    if (item.children?.length) {
      const found = findMenuTrailById(item.children, targetId, [...ancestors, item]);
      if (found.length) return found;
    }
  }

  return [];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedText(text: string, keyword: string, isActive = false) {
  const rawText = String(text || "");
  const normalizedKeyword = String(keyword || "").trim();
  if (!normalizedKeyword) return rawText;

  const matcher = new RegExp(`(${escapeRegExp(normalizedKeyword)})`, "ig");
  const parts = rawText.split(matcher);

  return parts.map((part, index) => {
    const isMatch = part.toLowerCase() === normalizedKeyword.toLowerCase();
    if (!isMatch) {
      return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
    }

    return (
      <mark
        key={`${part}-${index}`}
        className={`rounded px-1 py-0.5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] ${
          isActive ? "bg-white/30" : "bg-white/20"
        }`}
      >
        {part}
      </mark>
    );
  });
}

function collectActiveParentIds(
  items: MenuItem[],
  currentPath: string,
  ancestors: string[] = []
): string[] {
  for (const item of items || []) {
    const nextAncestors = [...ancestors, item.id];
    const isSelfActive = isMenuPathActive(item, currentPath);

    if (isSelfActive) {
      return ancestors;
    }

    if (item.children?.length) {
      const found = collectActiveParentIds(item.children, currentPath, nextAncestors);
      if (found.length) {
        return found;
      }
    }
  }

  return [];
}

function findSiblingIdsForMenu(
  items: MenuItem[],
  targetId: string
): string[] {
  for (const item of items || []) {
    const children = Array.isArray(item.children) ? item.children : [];
    if (children.some((child) => child.id === targetId)) {
      return children.map((child) => child.id);
    }
    const nested = findSiblingIdsForMenu(children, targetId);
    if (nested.length) return nested;
  }

  if (items.some((item) => item.id === targetId)) {
    return items.map((item) => item.id);
  }

  return [];
}

function normalizeOpenMenusByTree(
  items: MenuItem[],
  openIds: string[],
  lockedIds: string[] = []
): string[] {
  const openSet = new Set(openIds);
  const lockedSet = new Set(lockedIds);
  const kept = new Set<string>(lockedSet);

  const visit = (siblings: MenuItem[]) => {
    if (!Array.isArray(siblings) || !siblings.length) return;

    siblings.forEach((item) => {
      if (!openSet.has(item.id) && !lockedSet.has(item.id)) {
        visit(item.children || []);
        return;
      }
      kept.add(item.id);
      visit(item.children || []);
    });
  };

  visit(items);
  return Array.from(kept);
}

function filterMenuTree(items: MenuItem[], keyword: string): MenuItem[] {
  const normalizedKeyword = String(keyword || "").trim().toLowerCase();
  if (!normalizedKeyword) return items;

  return (items || []).reduce<MenuItem[]>((acc, item) => {
    const children = Array.isArray(item.children) ? item.children : [];
    const matchedChildren = filterMenuTree(children, normalizedKeyword);
    const haystack = [
      String(item.title || ""),
      String(item.slug || "").replace(/^\/+/, ""),
    ]
      .join(" ")
      .toLowerCase();
    const isMatched = haystack.includes(normalizedKeyword);

    if (isMatched || matchedChildren.length > 0) {
      acc.push({
        ...item,
        children: matchedChildren,
      });
    }

    return acc;
  }, []);
}

function collectAllParentIds(items: MenuItem[]): string[] {
  const ids: string[] = [];

  const visit = (nodes: MenuItem[]) => {
    nodes.forEach((item) => {
      if (item.children?.length) {
        ids.push(item.id);
        visit(item.children);
      }
    });
  };

  visit(items || []);
  return ids;
}

function getAvatarTheme(seed: string) {
  const themes = [
    { bg: "bg-blue-100", text: "text-blue-700", softBg: "bg-white/15", softRing: "ring-white/20" },
    { bg: "bg-emerald-100", text: "text-emerald-700", softBg: "bg-emerald-400/20", softRing: "ring-emerald-200/40" },
    { bg: "bg-amber-100", text: "text-amber-700", softBg: "bg-amber-400/20", softRing: "ring-amber-200/40" },
    { bg: "bg-rose-100", text: "text-rose-700", softBg: "bg-rose-400/20", softRing: "ring-rose-200/40" },
    { bg: "bg-violet-100", text: "text-violet-700", softBg: "bg-violet-400/20", softRing: "ring-violet-200/40" },
  ];
  const normalized = String(seed || "user");
  const hash = normalized.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length];
}

function getPasswordStrength(password: string) {
  const value = String(password || "");
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (!value) {
    return {
      score: 0,
      label: "Belum diisi",
      barClass: "bg-slate-200",
      textClass: "text-slate-400",
      width: "0%",
    };
  }
  if (score <= 1) {
    return {
      score,
      label: "Weak",
      barClass: "bg-rose-400",
      textClass: "text-rose-500",
      width: "25%",
    };
  }
  if (score === 2) {
    return {
      score,
      label: "Medium",
      barClass: "bg-amber-400",
      textClass: "text-amber-500",
      width: "50%",
    };
  }
  if (score === 3) {
    return {
      score,
      label: "Strong",
      barClass: "bg-emerald-400",
      textClass: "text-emerald-500",
      width: "75%",
    };
  }
  return {
    score,
    label: "Very Strong",
    barClass: "bg-emerald-500",
    textClass: "text-emerald-600",
    width: "100%",
  };
}

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/cms/login";
  const { title } = usePageTitle();

  const user = useDecryptedLoginState();
  const searchParams = useSearchParams();
  const authToken = String(user?.data?.token || "").trim();
  const authUserId = String(user?.data?.id || user?.data?.userId || "").trim();
  const isCmsSessionValid = Boolean(authToken && authUserId);

  // gabungkan pathname + querystring

  const [isFestate, setIsFestate] = useState<boolean | null>(false);
  const [curClick, setCurClick] = useState<string | null>("");
  const [qsUpdate, setqsUpdate] = useState<string | null>("");

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [isDesktopSidebar, setIsDesktopSidebar] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hoveredFlyouts, setHoveredFlyouts] = useState<HoveredFlyout[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [menuLoadError, setMenuLoadError] = useState<string | null>(null);
  const [hasMenuFetchCompleted, setHasMenuFetchCompleted] = useState(false);
  const [isMenuRenderReady, setIsMenuRenderReady] = useState(false);
  const [loadingMenuId, setLoadingMenuId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flyoutShowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [menus, setMenus] = useState<any>([]);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [openLang, setOpenLang] = useState<any>(false);
  const [openNotificationMenu, setOpenNotificationMenu] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationItems, setNotificationItems] = useState<RedmineNotificationItem[]>([]);
  const [notificationReadIds, setNotificationReadIds] = useState<string[]>([]);
  const [notificationFilter, setNotificationFilter] =
    useState<NotificationFilter>("all");
  const [notificationPulse, setNotificationPulse] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const router = useRouter();
  const dispatch = useDispatch();
  const sidebarNavRef = useRef<HTMLElement | null>(null);
  const sidebarAsideRef = useRef<HTMLElement | null>(null);
  const [localData, setLocalData] = useState<any>(null); // ⬅️ taruh hasil decrypt di state
  const [lang, setLang] = useState<"ID" | "EN">(user?.data?.langCode);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const previousUnreadCountRef = useRef(0);
  const notificationReadyRef = useRef(false);
  const notificationRequestRef = useRef(0);
  const notificationReadIdsRef = useRef<string[]>([]);
  const authRefreshInFlightRef = useRef(false);
  const authTokenRef = useRef(authToken);

  useEffect(() => {
    authTokenRef.current = authToken;
  }, [authToken]);

  const displayName = String(user?.data?.name || user?.data?.email || "User").trim();
  const displayEmail = String(user?.data?.email || "-").trim();
  const avatarInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";
  const avatarTheme = getAvatarTheme(displayEmail || displayName);
  const passwordStrength = getPasswordStrength(passwordForm.newPassword);
  const confirmPasswordState =
    !passwordForm.confirmPassword.trim()
      ? null
      : passwordForm.newPassword === passwordForm.confirmPassword
      ? "match"
      : "mismatch";
  const notificationUserKey =
    String(user?.data?.id || user?.data?.userId || "").trim() || null;
  const notificationReadStorageKey = notificationUserKey
    ? `redmine-notification-read-ids:${notificationUserKey}`
    : null;
  const notificationLastSeenStorageKey = notificationUserKey
    ? `redmine-notification-last-seen:${notificationUserKey}`
    : null;
  const unreadNotificationCount = notificationItems.filter(
    (item) => !notificationReadIds.includes(String(item.id))
  ).length;
  const visibleNotificationItems = notificationItems.filter((item) =>
    notificationFilter === "all" ? true : item.type === notificationFilter
  );
  const searchSourceMenus = menus || [];
  const filteredMenus = filterMenuTree(searchSourceMenus, sidebarSearch);
  const displayedMenus = sidebarSearch.trim() ? filteredMenus : menus || [];

  const handleMouseEnter = () => {
    if (!isDesktopSidebar) return;
    if (isSidebarPinned) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsCollapsed(false);
  };

  const clearSidebarCollapseTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const isElementInsideSidebarExperience = (node: Node | null) => {
    if (!node || !(node instanceof Element)) return false;
    return Boolean(
      sidebarAsideRef.current?.contains(node) ||
        node.closest('[data-sidebar-experience="true"]')
    );
  };

  const handleMouseLeave = (event?: React.MouseEvent<HTMLElement>) => {
    if (!isDesktopSidebar) return;
    if (isSidebarPinned) return;
    const nextTarget = (event?.relatedTarget as Node | null) ?? null;
    if (isElementInsideSidebarExperience(nextTarget)) {
      return;
    }
    clearSidebarCollapseTimeout();
    timeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 500);
  };
  const clearFlyoutHideTimeout = () => {
    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current);
      flyoutTimeoutRef.current = null;
    }
  };

  const clearFlyoutShowTimeout = () => {
    if (flyoutShowTimeoutRef.current) {
      clearTimeout(flyoutShowTimeoutRef.current);
      flyoutShowTimeoutRef.current = null;
    }
  };

  const keepFlyoutOpen = () => {
    clearFlyoutHideTimeout();
    clearSidebarCollapseTimeout();
    setIsCollapsed(false);
  };

  const scheduleHideFlyout = (depth = 0) => {
    clearFlyoutShowTimeout();
    clearFlyoutHideTimeout();
    flyoutTimeoutRef.current = setTimeout(() => {
      if (depth <= 0) {
        setHoveredFlyouts([]);
        return;
      }
      setHoveredFlyouts((prev) => prev.filter((panel) => panel.depth < depth));
    }, FLYOUT_HIDE_DELAY_MS);
  };

  const closeFlyoutImmediately = (depth = 0) => {
    clearFlyoutShowTimeout();
    clearFlyoutHideTimeout();
    if (depth <= 0) {
      setHoveredFlyouts([]);
      return;
    }
    setHoveredFlyouts((prev) => prev.filter((panel) => panel.depth < depth));
  };

  const showFlyout = (item: MenuItem, rect: DOMRect, parentDepth = 0) => {
    if (!item.children?.length) return;
    clearFlyoutShowTimeout();
    clearFlyoutHideTimeout();
    const renderFlyout = (targetRect: DOMRect) => {
      const panelWidth = 320;
      const estimatedPanelHeight = Math.min(
        560,
        64 + Math.max(1, item.children?.length || 0) * 44
      );
      const viewportPadding = 12;
      const maxTop = Math.max(
        viewportPadding,
        window.innerHeight - estimatedPanelHeight - viewportPadding
      );
      const nextTop = Math.min(Math.max(targetRect.top, viewportPadding), maxTop);
      const nextLeft = Math.min(
        targetRect.right + 8,
        window.innerWidth - panelWidth - viewportPadding
      );
      const nextDepth = parentDepth + 1;
      setHoveredFlyouts((prev) => {
        const preserved = prev.filter((panel) => panel.depth < nextDepth);
        return [
          ...preserved,
          {
            depth: nextDepth,
            title: item.title,
            items: item.children || [],
            left: nextLeft,
            top: nextTop,
          },
        ];
      });
    };

    if (isCollapsed) {
      setIsCollapsed(false);
      setHoveredFlyouts([]);
      flyoutShowTimeoutRef.current = setTimeout(() => {
        renderFlyout(rect);
      }, 320);
      return;
    }

    renderFlyout(rect);
  };
  const persistSidebarScroll = () => {
    if (typeof window === "undefined") return;
    const nextScrollTop = sidebarNavRef.current?.scrollTop ?? 0;
    window.sessionStorage.setItem(
      SIDEBAR_SCROLL_STORAGE_KEY,
      String(nextScrollTop)
    );
  };

  const restoreSidebarScroll = () => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(SIDEBAR_SCROLL_STORAGE_KEY);
    const nextScrollTop = Number(raw || "0");
    if (!sidebarNavRef.current || Number.isNaN(nextScrollTop)) return;
    sidebarNavRef.current.scrollTop = nextScrollTop;
  };
  const restoreSidebarScrollTo = (scrollTop: number) => {
    if (typeof window === "undefined") return;
    const apply = () => {
      if (!sidebarNavRef.current) return;
      sidebarNavRef.current.scrollTop = scrollTop;
    };
    window.requestAnimationFrame(() => {
      apply();
      window.requestAnimationFrame(apply);
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const applyDesktopState = (matches: boolean) => {
      setIsDesktopSidebar(matches);
      if (!matches) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsCollapsed(false);
        return;
      }
      const rawPinned = window.localStorage.getItem(SIDEBAR_PIN_STORAGE_KEY);
      const nextPinned = rawPinned === null ? true : rawPinned === "true";
      setIsSidebarPinned(nextPinned);
      setIsCollapsed(!nextPinned);
    };

    applyDesktopState(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applyDesktopState(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);
  const setSidebarPinnedState = (nextPinned: boolean) => {
    setIsSidebarPinned(nextPinned);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_PIN_STORAGE_KEY, String(nextPinned));
    }
    if (isDesktopSidebar) {
      setIsCollapsed(!nextPinned);
    }
  };

  const persistOpenMenus = (nextOpenMenus: string[]) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(
      SIDEBAR_OPEN_MENUS_STORAGE_KEY,
      JSON.stringify(nextOpenMenus)
    );
  };

  const restoreOpenMenus = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.sessionStorage.getItem(SIDEBAR_OPEN_MENUS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === "string")
        : [];
    } catch (error) {
      console.error("Failed to restore sidebar open menus:", error);
      return [];
    }
  };

  const getMenu = async (forceRefresh = false) => {
    if (!forceRefresh && typeof window !== "undefined") {
      try {
        const cached = window.sessionStorage.getItem(SIDEBAR_MENU_CACHE_KEY);
    
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            window.sessionStorage.removeItem(SIDEBAR_MENU_CACHE_KEY);
          } else if (
            Array.isArray(parsed?.menus) &&
            typeof parsed?.cachedAt === "number" &&
            Date.now() - parsed.cachedAt < SIDEBAR_MENU_CACHE_TTL_MS
          ) {
              setMenuLoadError(null);
              setMenus(parsed.menus);
              setHasMenuFetchCompleted(true);
              setIsMenuRenderReady(true);
              setIsMenuLoading(false);
              return;
          }
        }
      } catch (error) {
        console.error("Failed to read sidebar menu cache:", error);
      }
    }

    setIsMenuLoading(true);
    setMenuLoadError(null);
    setHasMenuFetchCompleted(false);
    setIsMenuRenderReady(false);
    try {
      const dataapi = await FetchData(
        `api/general/sidebarpanel`,
        "GET",
        "",
        false,
        user?.data?.token,
        false
      );
      const nextMenus = dataapi?.data?.body || [];
      
      setMenus(nextMenus);
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            SIDEBAR_MENU_CACHE_KEY,
            JSON.stringify({
              cachedAt: Date.now(),
              menus: Array.isArray(nextMenus) ? nextMenus : [],
            })
          );
        } catch (error) {
          console.error("Failed to cache sidebar menu:", error);
        }
      }
      setHasMenuFetchCompleted(true);
    } catch (error) {
      console.error("Failed to fetch sidebar menu:", error);
      setMenuLoadError("Gagal memuat menu");
      setMenus([]);
      setHasMenuFetchCompleted(true);
    }
  };
  const refreshAuthSession = async () => {
    if (!isCmsSessionValid || authRefreshInFlightRef.current) return;

    authRefreshInFlightRef.current = true;
    try {
      const rsp = await FetchData(
        "api/auth/session",
        "GET",
        "",
        false,
        authTokenRef.current,
        false
      );

      if (rsp?.code !== 200) return;

      const encryptedSession = GetEncrypt(JSON.stringify(rsp));
      const remember =
        typeof window !== "undefined" &&
        window.localStorage.getItem(AUTH_REMEMBER_KEY) === "1";
      saveAuthSession(encryptedSession, remember);
      dispatch(setLocal(encryptedSession));
    } finally {
      authRefreshInFlightRef.current = false;
    }
  };
  function normalizeBasePath(path: string, isFe: boolean): string {
    return normalizeMenuPath(path, isFe);
  }
  const handleLogout = async () => {
    try {
      const myCache = new NodeCache({
        stdTTL: Number(process.env.NEXT_PUBLIC_CHACE_TIME),
      });

      myCache.flushAll();
      window.sessionStorage.removeItem(SIDEBAR_MENU_CACHE_KEY);
      // 1. Hapus token di localStorage/sessionStorage
      clearStoredAuthSession();

      // 2. Panggil API logout (jika kamu punya endpoint logout)

      const dataLogout = await FetchData(
        "api/auth/logout",
        "PUT",
        GetEncrypt(JSON.stringify({ id: "1" })),
        false,
        user?.data?.token,
        true
      );

      // 3. Redirect ke halaman login atau root
      if (dataLogout?.code == "200") {
        localStorage.clear();
        sessionStorage.clear();
        startCmsNavigationLoading();
        setTimeout(() => {
          window.location.assign("/cms/login");
        }, 1000);
      }
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };
  const openEditProfileModal = () => {
    setOpenProfileMenu(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPassword({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
    setOpenEditProfile(true);
  };
  const loadNotifications = async () => {
    if (!user?.data?.token) return;
    const requestId = Date.now();
    notificationRequestRef.current = requestId;
    setNotificationLoading(true);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch(
        buildApiUrl(`api/redmine/notification?t=${Date.now()}`),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.data?.token}`,
            "Content-Type": "text/plain",
          },
          cache: "no-store",
          signal: controller.signal,
        }
      );
      window.clearTimeout(timeout);

      const raw = await response.text();
      const parsed = JSON.parse(GetDecrypt(raw));

      if (notificationRequestRef.current !== requestId) return;

      if (parsed?.code === 200) {
        setNotificationItems(parsed?.data?.items || []);
      } else {
        setNotificationItems([]);
      }
    } catch (error) {
      if (notificationRequestRef.current !== requestId) return;
      console.error("Failed to load notifications", error);
      setNotificationItems([]);
    } finally {
      if (notificationRequestRef.current !== requestId) return;
      setNotificationLoading(false);
    }
  };
  const playNotificationSound = () => {
    if (typeof window === "undefined") return;
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.22);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.24);
    oscillator.onended = () => {
      audioContext.close().catch(() => undefined);
    };
  };
  const handleOpenNotifications = async () => {
    const nextState = !openNotificationMenu;
    setOpenNotificationMenu(nextState);
    setOpenProfileMenu(false);
    if (!nextState) return;

    // loadNotifications();
  };
  const markNotificationAsRead = (notificationId: string) => {
    const currentReadIds = notificationReadIdsRef.current;
    if (currentReadIds.includes(notificationId)) return;

    const next = [...currentReadIds, notificationId];
    notificationReadIdsRef.current = next;
    setNotificationReadIds(next);

    if (typeof window !== "undefined" && notificationReadStorageKey) {
      localStorage.setItem(notificationReadStorageKey, JSON.stringify(next));
    }
  };
  const handleChangePassword = async () => {
    if (savingProfile) return;
    if (
      !passwordForm.currentPassword.trim() ||
      !passwordForm.newPassword.trim() ||
      !passwordForm.confirmPassword.trim()
    ) {
      alert("Semua field password wajib diisi");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Konfirmasi password baru tidak sama");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Password baru minimal 6 karakter");
      return;
    }

    setSavingProfile(true);
    try {
      const payload = GetEncrypt(
        JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        })
      );
      const rsp = await FetchData(
        "api/auth/profile/password",
        "PUT",
        payload,
        false,
        user?.data?.token,
        true
      );
      if (rsp?.code === 200) {
        setOpenEditProfile(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } finally {
      setSavingProfile(false);
    }
  };
  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    if (isCmsSessionValid) {
      setIsCheckingAuth(false);
      return;
    }

    clearStoredAuthSession();
    dispatch(setLocal({}));
    setIsCheckingAuth(false);

    const timeout = window.setTimeout(() => {
      window.location.replace("/cms/login");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [isLoginPage, isCmsSessionValid, dispatch]);
  useEffect(() => {
    if (isLoginPage || !isCmsSessionValid) return;
    getMenu();
    setLang(user?.data?.langCode);
  }, [isLoginPage, isCmsSessionValid, authToken]);
  useEffect(() => {
    if (isLoginPage || !isCmsSessionValid) return;
    // refreshAuthSession();
  }, [isLoginPage, isCmsSessionValid, pathname]);
  useEffect(() => {
    if (isLoginPage || !isCmsSessionValid) return;

    // const handleFocus = () => refreshAuthSession();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // refreshAuthSession();
      }
    };
    const handlePermissionUpdated = async () => {
      // await refreshAuthSession();
      await getMenu(true);
    };

    // window.addEventListener("focus", handleFocus);
    window.addEventListener("cms:permission:updated", handlePermissionUpdated);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // window.removeEventListener("focus", handleFocus);
      window.removeEventListener("cms:permission:updated", handlePermissionUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoginPage, isCmsSessionValid]);
  useEffect(() => {
    if (!hasMenuFetchCompleted) return;

    if (menuLoadError) {
      const timeout = window.setTimeout(() => {
        setIsMenuRenderReady(true);
      }, 220);
      return () => window.clearTimeout(timeout);
    }

    if (!Array.isArray(menus) || menus.length === 0) return;

    const frame = window.requestAnimationFrame(() => {
      const timeout = window.setTimeout(() => {
        setIsMenuRenderReady(true);
      }, 260);
      return () => window.clearTimeout(timeout);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hasMenuFetchCompleted, menus, menuLoadError]);
  useEffect(() => {
    if (!isMenuRenderReady) return;
    setIsMenuLoading(false);
  }, [isMenuRenderReady]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setOpenNotificationMenu(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setOpenProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    setHoveredFlyouts([]);
  }, [pathname, searchParams]);
  useEffect(() => {
    notificationReadIdsRef.current = notificationReadIds;
  }, [notificationReadIds]);
  useEffect(() => {
    if (typeof window === "undefined" || !notificationReadStorageKey) return;

    const storedReadIds = localStorage.getItem(notificationReadStorageKey);
    let parsedReadIds: string[] = [];
    if (storedReadIds) {
      try {
        const value = JSON.parse(storedReadIds);
        if (Array.isArray(value)) {
          parsedReadIds = value.map((item) => String(item));
        }
      } catch (error) {
        console.error("Failed to parse notification read ids", error);
      }
    }

    const legacyLastSeen = notificationLastSeenStorageKey
      ? localStorage.getItem(notificationLastSeenStorageKey)
      : null;

    if (legacyLastSeen && notificationItems.length > 0) {
      const seenTime = new Date(legacyLastSeen).getTime();
      const migratedReadIds = notificationItems
        .filter((item) => {
          const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : 0;
          return itemTime <= seenTime;
        })
        .map((item) => String(item.id));
      parsedReadIds = [...new Set([...parsedReadIds, ...migratedReadIds])];
    }

    setNotificationReadIds(parsedReadIds);
    localStorage.setItem(notificationReadStorageKey, JSON.stringify(parsedReadIds));
  }, [notificationItems, notificationReadStorageKey, notificationLastSeenStorageKey]);
 
  
  useEffect(() => {
    if (!user?.data?.token) return;
    // const timer = window.setInterval(() => {
    //   loadNotifications();
    // }, 60000);

    // return () => window.clearInterval(timer);
  }, [user?.data?.token]);
  useEffect(() => {
    if (!notificationReadyRef.current) {
      previousUnreadCountRef.current = unreadNotificationCount;
      notificationReadyRef.current = true;
      return;
    }

    if (unreadNotificationCount > previousUnreadCountRef.current) {
      setNotificationPulse(true);
      playNotificationSound();
      const timeout = window.setTimeout(() => {
        setNotificationPulse(false);
      }, 2200);
      previousUnreadCountRef.current = unreadNotificationCount;
      return () => window.clearTimeout(timeout);
    }

    previousUnreadCountRef.current = unreadNotificationCount;
  }, [unreadNotificationCount]);
  useEffect(() => {
    if (!menus?.length) return;
    const queryString = searchParams.toString();
    const currentPath = normalizeBasePath(pathname + "?" + queryString, false);
    const activeParentIds = collectActiveParentIds(menus, currentPath);

    setOpenMenus((prev) => {
      const restored = restoreOpenMenus();
      const next = Array.from(new Set([...restored, ...prev, ...activeParentIds]));
      persistOpenMenus(next);
      return next;
    });
  }, [menus, pathname, searchParams]);
  useEffect(() => {
    if (!menus?.length) return;

    const frame = window.requestAnimationFrame(() => {
      restoreSidebarScroll();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [menus, pathname, searchParams]);
  useEffect(() => {
    // Reset loader ketika route berubah
    setLoadingMenuId(null);
    setIsNavigating(false);
    stopCmsNavigationLoading();
  }, [pathname]);
  useEffect(() => {
    const queryString = searchParams.toString();
    setqsUpdate("?" + queryString);
    setLoadingMenuId(null);
    setIsNavigating(false);
    stopCmsNavigationLoading();
  }, [searchParams]);
  useEffect(() => {
    const onStart = () => setIsNavigating(true);
    const onStop = () => setIsNavigating(false);

    const onDocClick = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const downloadAttr = anchor.getAttribute("download");
      const targetBlank = anchor.getAttribute("target") === "_blank";
      const isExternal = /^https?:\/\//i.test(href);
      const isHash = href.startsWith("#");
      const isBlob = href.startsWith("blob:");
      const isMailOrTel = href.startsWith("mailto:") || href.startsWith("tel:");
      const isCmsInternal = href.startsWith("/cms") || href.startsWith("?");
      if (
        !href ||
        downloadAttr ||
        targetBlank ||
        isExternal ||
        isHash ||
        isBlob ||
        isMailOrTel ||
        !isCmsInternal
      ) {
        return;
      }
      startCmsNavigationLoading();
    };

    window.addEventListener("cms:navigation:start", onStart);
    window.addEventListener("cms:navigation:stop", onStop);
    document.addEventListener("click", onDocClick, true);

    return () => {
      window.removeEventListener("cms:navigation:start", onStart);
      window.removeEventListener("cms:navigation:stop", onStop);
      document.removeEventListener("click", onDocClick, true);
    };
  }, []);
  useEffect(() => {
    const node = sidebarNavRef.current;
    if (!node) return;

    const onScroll = () => {
      persistSidebarScroll();
    };

    node.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      node.removeEventListener("scroll", onScroll);
    };
  }, [menus]);
  useEffect(() => {
    const walk = (items: any[]) => {
      items?.forEach((item) => {
        if (item?.slug && item.slug !== "#") {
          router.prefetch(item.slug);
        }
        if (item?.children?.length) walk(item.children);
      });
    };
    walk(menus || []);
  }, [menus, router]);
  const changeLangUser = async (langs) => {
    const raw = JSON.stringify({
      lang: langs,
    });
    const aesraw = GetEncrypt(raw);
    const data = FetchData(
      "api/general/languser",
      "POST",
      aesraw,
      false,
      user?.data?.token,
      true
    );
    const datajson = await data;
    if (datajson?.code == "200") {
      // refreshAuthSession();
      await getMenu(true);
      dispatch(setLocal(GetEncrypt(JSON.stringify(datajson))));
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
    }
  };

  function renderMenuIcon(item: MenuItem) {
    if (!item.icon) return null;

    const fallbackInitial = String(item.title || "M")
      .trim()
      .charAt(0)
      .toUpperCase();

    return (
      <span className="relative flex h-8 w-8 items-center justify-center shrink-0">
        <img
          className="h-4 w-4 object-contain"
          src={item.icon}
          alt={item.title || "menu icon"}
          onError={(event) => {
            const target = event.currentTarget;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement | null;
            if (fallback) {
              fallback.style.display = "flex";
            }
          }}
        />
        <span className="hidden h-4 w-4 items-center justify-center rounded text-[10px] font-semibold text-white/80">
          {fallbackInitial}
        </span>
      </span>
    );
  }

  function SidebarItem({
    item,
    isCollapsed,
    depth,
    isOpen,
    openMenus,
    pathname,
    currentPath,
    searchKeyword,
    loadingMenuId,
    setLoadingMenuId,
    setIsNavigating,
    onToggleMenu,
    onExpandSidebar,
    onNavigate,
  }: SidebarItemProps) {
    const router = useRouter();
    
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isMenuPathActive(item, currentPath);
    const hasActiveChild = Boolean(
      item.children?.some((child) => isMenuOrDescendantActive(child, currentPath))
    );
    const isParentHighlighted = hasChildren && hasActiveChild;
    const showActiveIndicator = isActive || isParentHighlighted;
    const shouldShowChildren = hasChildren && isOpen && !isCollapsed;
    const childCount = item.children?.length || 0;
    const itemIndent = isCollapsed ? 0 : Math.min(depth * 14, 42);
    const parentButtonClass = `relative flex items-center w-full rounded-xl transition-all duration-200 ${
      isParentHighlighted
        ? "bg-white/16 font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
        : "hover:bg-white/10"
    } ${
      isCollapsed ? "justify-center px-0 py-2" : "justify-between gap-2 px-2 py-2"
    }`;
    const baseLinkClass = `group/flyoutitem relative flex items-center transition-all duration-200 rounded-xl ${
      isCollapsed
        ? "justify-center px-0 py-2 mx-1"
        : "justify-start gap-2 px-2 py-2"
    }`;
    const inlineLinkStateClass = isActive
      ? "bg-white/16 font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
      : "hover:bg-white/10";

    return (
      <div className="group/menu relative w-full">
        {depth > 0 && !isCollapsed ? (
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-[15px] top-0 w-px bg-white/12"
            style={{ transform: `translateX(${Math.max(itemIndent - 12, 0)}px)` }}
          />
        ) : null}
        {hasChildren ? (
          <div className="relative mb-1" style={{ paddingLeft: itemIndent }}>
            <button
              type="button"
              title={isCollapsed ? item.title : undefined}
              onClick={() => {
                setLoadingMenuId(null);
                if (isCollapsed) {
                  onExpandSidebar();
                }
                onToggleMenu(item.id);
              }}
              className={parentButtonClass}
              aria-expanded={isOpen}
            >
              {showActiveIndicator ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.65)] transition-all ${
                    isCollapsed ? "left-1/2 -translate-x-[26px]" : ""
                  }`}
                />
              ) : null}
              <div
                className={`flex min-w-0 flex-1 items-center ${
                  isCollapsed ? "justify-center" : "gap-2"
                }`}
              >
                {renderMenuIcon(item)}
                {!isCollapsed && (
                  <span className={`truncate ${isParentHighlighted ? "font-semibold" : ""}`}>
                    {renderHighlightedText(
                      item.title,
                      searchKeyword,
                      isParentHighlighted
                    )}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <span className="ml-auto flex items-center gap-1">
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/65">
                    {childCount}
                  </span>
                  <FiChevronRight
                    className={`shrink-0 text-white/70 transition-transform duration-200 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </span>
              )}
            </button>
            {shouldShowChildren ? (
              <div className="mt-1 space-y-1">
                {item.children?.map((child) => (
                  <SidebarItem
                    key={child.id}
                    item={child}
                    isCollapsed={isCollapsed}
                    depth={depth + 1}
                    isOpen={openMenus.includes(child.id)}
                    openMenus={openMenus}
                    pathname={pathname}
                    currentPath={currentPath}
                    searchKeyword={searchKeyword}
                    loadingMenuId={loadingMenuId}
                    setLoadingMenuId={setLoadingMenuId}
                    setIsNavigating={setIsNavigating}
                    onToggleMenu={onToggleMenu}
                    onExpandSidebar={onExpandSidebar}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="relative mb-1" style={{ paddingLeft: itemIndent }}>
            <Link
              href={item.slug || "#"}
              prefetch={true}
              onClick={(e) => {
                if (!item.slug || item.slug === "#") {
                  e.preventDefault();
                  return;
                }
                const isExternal = /^https?:\/\//i.test(item.slug);
                if (isExternal) return;
                e.preventDefault();
                const currentPath = normalizeNavigationPath(
                  pathname + qsUpdate,
                  item.isFe
                );
                const targetPath = normalizeNavigationPath(item.slug || "", item.isFe);
                if (targetPath === currentPath) {
                  e.preventDefault();
                  setLoadingMenuId(null);
                  setIsNavigating(false);
                  return;
                }
                persistSidebarScroll();
                setLoadingMenuId(item.id);
                setCurClick(normalizeBasePath(item.slug || "", item.isFe));
                setIsFestate(item?.isFe);
                setIsNavigating(true);
                onNavigate?.();
                startCmsNavigationLoading();
                router.push(item.slug);
              }}
              className={`${baseLinkClass} ${inlineLinkStateClass}`}
              title={isCollapsed ? item.title : undefined}
            >
              {isActive ? (
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.65)] transition-all ${
                  isCollapsed ? "left-1/2 -translate-x-[26px]" : ""
                }`}
              />
              ) : null}
              {renderMenuIcon(item)}
              {!isCollapsed && (
                <>
                  <span className={`truncate ${isActive ? "font-semibold" : ""}`}>
                    {renderHighlightedText(item.title, searchKeyword, isActive)}
                  </span>
                  {loadingMenuId === item.id && (
                    <span className="ml-auto inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  )}
                </>
              )}
            </Link>
          </div>
        )}
      </div>
    );
  }
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const currentSidebarPath = normalizeBasePath(
    pathname + "?" + searchParams.toString(),
    false
  );
  const activeParentIds = collectActiveParentIds(menus || [], currentSidebarPath);

  const toggleMenu = (id: string) => {
    const currentScrollTop = sidebarNavRef.current?.scrollTop ?? 0;
    setOpenMenus((prev) => {
      const isCurrentlyOpen = prev.includes(id);

      const nextOpenMenus = isCurrentlyOpen
        ? prev.filter((menuId) => menuId !== id)
        : [...prev, id];

      const normalizedOpenMenus = normalizeOpenMenusByTree(
        menus || [],
        Array.from(new Set(nextOpenMenus)),
        activeParentIds
      );
      persistOpenMenus(normalizedOpenMenus);
      return normalizedOpenMenus;
    });
    persistSidebarScroll();
    restoreSidebarScrollTo(currentScrollTop);
  };
  useEffect(() => {
    if (!menus?.length) return;

    const restored = restoreOpenMenus();
    setOpenMenus((prev) => {
      const merged = Array.from(
        new Set([...restored, ...prev, ...activeParentIds])
      );
      const normalized = normalizeOpenMenusByTree(
        menus || [],
        merged,
        activeParentIds
      );
      persistOpenMenus(normalized);
      return normalized;
    });
  }, [menus, currentSidebarPath]);

  useEffect(() => {
    const keyword = sidebarSearch.trim();
    if (!keyword) return;

    const matchingParentIds = collectActiveParentIds(filteredMenus, currentSidebarPath);
    setOpenMenus((prev) => {
      const next = normalizeOpenMenusByTree(
        menus || [],
        Array.from(new Set([...prev, ...matchingParentIds, ...activeParentIds])),
        activeParentIds
      );
      persistOpenMenus(next);
      return next;
    });
  }, [sidebarSearch, filteredMenus, menus, activeParentIds]);

  if (isLoginPage) return <>{children}</>;

  if (isCheckingAuth || !isCmsSessionValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex items-center gap-3 rounded-lg bg-white px-6 py-4 shadow">
          <RingLoader size={28} color="#2A53CC" />
          <span className="text-sm text-gray-700">Checking session...</span>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-6 shrink-0">
        {/* <div className="mb-3 flex w-full justify-end">
          <button
            type="button"
            onClick={() => setSidebarPinnedState(!isSidebarPinned)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/85 transition hover:bg-white/15 hover:text-white"
            aria-label={isSidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
            title={isSidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {isSidebarPinned ? <FiChevronsLeft size={14} /> : <FiChevronsRight size={14} />}
          </button>
        </div> */}
        <div className="flex justify-center items-center w-full">
          <img src={"/images/logocms.png"} className="w-12" />
        </div>
      </div>

      {!isCollapsed && (
        <div className="mb-4 shrink-0">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/55" />
            <input
              type="text"
              value={sidebarSearch}
              onChange={(event) => setSidebarSearch(event.target.value)}
              placeholder="Cari menu atau submenu..."
              className="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-9 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-white/30 focus:bg-white/14"
            />
            {sidebarSearch ? (
              <button
                type="button"
                onClick={() => setSidebarSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/55 transition hover:bg-white/10 hover:text-white"
                aria-label="Hapus pencarian menu"
              >
                <FiX size={14} />
              </button>
            ) : null}
          </div>
        </div>
      )}

      <nav
        ref={sidebarNavRef}
        className="flex flex-1 flex-col overflow-y-auto overflow-x-visible pr-1 text-sm"
      >
        {isMenuLoading ? (
          <div
            className={`flex w-full flex-col items-center ${
              isCollapsed ? "justify-start pt-4" : "justify-start px-3 pt-3"
            }`}
          >
            <RingLoader size={isCollapsed ? 24 : 32} color="#ffffff" />
            {!isCollapsed && (
              <span className="mt-4 text-center text-xs text-white/70">
                Memuat menu...
              </span>
            )}
          </div>
        ) : menuLoadError ? (
          <div
            className={`rounded-lg border border-white/10 bg-white/5 ${
              isCollapsed ? "mx-1 px-2 py-3 text-center text-[10px]" : "mx-2 px-3 py-3 text-xs"
            } text-white/75`}
          >
            {isCollapsed ? "Menu error" : menuLoadError}
          </div>
        ) : (
          <>
            {displayedMenus?.length ? (
              displayedMenus?.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                  depth={0}
                  isOpen={sidebarSearch.trim() ? true : openMenus.includes(item.id)}
                  openMenus={sidebarSearch.trim() ? collectAllParentIds(displayedMenus) : openMenus}
                  pathname={pathname}
                  currentPath={currentSidebarPath}
                  searchKeyword={sidebarSearch}
                  loadingMenuId={loadingMenuId}
                  setLoadingMenuId={setLoadingMenuId}
                  setIsNavigating={setIsNavigating}
                  onToggleMenu={toggleMenu}
                  onExpandSidebar={() => setSidebarPinnedState(true)}
                  onNavigate={() => undefined}
                />
              ))
            ) : (
              <div className="mx-2 rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-4 text-xs text-white/70">
                Tidak ada menu yang cocok dengan pencarian Anda.
              </div>
            )}
          </>
        )}

      </nav>
    </div>
  );
  return (
    <div className="min-h-screen flex font-sans w-full ">
      {/* SIDEBAR */}
      <aside
        ref={sidebarAsideRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`bg-card-gradient text-white transition-[width] duration-300 ease-in-out flex ${
          isCollapsed ? "w-20" : "w-56"
        } min-h-screen self-stretch fixed top-0 p-3 shadow-lg z-40`}
      >
        {sidebarContent}
      </aside>

      <style jsx global>{`
        @keyframes sidebarFlyoutIn {
          0% {
            opacity: 0;
            transform: translate3d(-8px, 0, 0) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .sidebar-flyout-panel {
          transform-origin: top left;
          animation: sidebarFlyoutIn 140ms ease-out;
          will-change: transform, opacity;
        }

        .sidebar-flyout-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.35) transparent;
        }

        .sidebar-flyout-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .sidebar-flyout-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-flyout-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.22);
          border-radius: 9999px;
        }

        .sidebar-flyout-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.38);
        }
      `}</style>

      {/* CONTENT */}
      <div className={`flex-1 flex flex-col min-w-0 ${isCollapsed ? "ml-20" : "ml-56"} transition-[margin] duration-300 ease-in-out`}>
        {/* HEADER */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (!isDesktopSidebar) {
                  setIsCollapsed(!isCollapsed);
                  return;
                }
                const nextCollapsed = !isCollapsed;
                setSidebarPinnedState(!nextCollapsed);
              }}
              className="rounded-xl border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50 hover:text-black"
            >
              <FiMenu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setOpenLang(!openLang)}
                className="px-2 py-1 text-sm font-medium border rounded-lg hover:bg-gray-100 flex items-center gap-1"
              >
                {lang === "ID" ? "🇮🇩 ID" : "🇺🇸 EN"}
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openLang && (
                <div className="absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setLang("ID");
                      setOpenLang(false);
                      if (lang != "ID") {
                        changeLangUser("ID");
                      }
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    🇮🇩 Indonesia
                  </button>
                  <button
                    onClick={() => {
                      setLang("EN");
                      setOpenLang(false);

                      if (lang != "EN") {
                        changeLangUser("EN");
                      }
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    🇺🇸 English
                  </button>
                </div>
              )}
            </div>

            <div className="relative z-100" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setOpenProfileMenu((prev) => !prev)}
                className="flex items-center gap-3 rounded-full border border-gray-200 bg-white pl-2 pr-3 py-1.5 hover:bg-gray-50"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${avatarTheme.bg} ${avatarTheme.text}`}
                >
                  {avatarInitials}
                </div>
                <div className="hidden text-left md:block">
                  <div className="text-sm font-semibold text-gray-700 leading-none">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-gray-400 leading-none mt-1">
                    {displayEmail}
                  </div>
                </div>
              </button>

              {openProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg z-100">
                  <div className="border-b border-gray-100 px-3 py-2">
                    <div className="text-sm font-semibold text-gray-800">{displayName}</div>
                    <div className="text-xs text-gray-400">{displayEmail}</div>
                  </div>
                  <button
                    type="button"
                    onClick={openEditProfileModal}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiLock />
                    Edit Password
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CHILDREN */}
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
      {isNavigating && (
        <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white rounded-lg px-6 py-4 shadow-lg flex items-center gap-3">
            <RingLoader size={28} color="#2A53CC" />
            <span className="text-sm text-gray-700">Loading page...</span>
          </div>
        </div>
      )}
      {openEditProfile && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <div className="text-lg font-semibold text-gray-800">Edit Profile</div>
                <div className="text-sm text-gray-400">Hanya ubah password akun login.</div>
              </div>
              <button
                type="button"
                onClick={() => setOpenEditProfile(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div>
                <div className="mb-1 text-sm font-medium text-gray-600">Password Saat Ini</div>
                <div className="relative">
                  <input
                    type={showPassword.currentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-11 text-sm outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        currentPassword: !prev.currentPassword,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.currentPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-gray-600">Password Baru</div>
                <div className="relative">
                  <input
                    type={showPassword.newPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-11 text-sm outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        newPassword: !prev.newPassword,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.newPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Password strength</span>
                    <span className={passwordStrength.textClass}>{passwordStrength.label}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.barClass}`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-gray-400">
                    Gunakan minimal 8 karakter, huruf besar/kecil, angka, dan simbol.
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-gray-600">Konfirmasi Password Baru</div>
                <div className="relative">
                  <input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-11 text-sm outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {confirmPasswordState && (
                  <div
                    className={`mt-2 text-[11px] ${
                      confirmPasswordState === "match"
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {confirmPasswordState === "match"
                      ? "Konfirmasi password sudah sama"
                      : "Konfirmasi password belum sama"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setOpenEditProfile(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={savingProfile}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
