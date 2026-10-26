import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  totalPage?: any;
  currentPage?: any;
  onClick?: (page: any) => void;
}

const Pagination = ({
  totalPage = 1,
  currentPage = 1,
  onClick = (page) => {},
}: PaginationProps) => {
  const maxVisible = 5;
  let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
  let endPage = startPage + maxVisible - 1;

  if (endPage > totalPage) {
    endPage = totalPage;
    startPage = Math.max(endPage - maxVisible + 1, 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return (
    totalPage > 1 && (
      <div className="flex justify-center gap-2">
        {currentPage - 1 > 0 ? (
          <div
            className={`w-[32px] h-[32px] flex items-center justify-center  cursor-pointer select-none hover:bg-[#060822] hover:text-[white] transition-all duration-[0.5s] bg-white
         shadow rounded-full `}
            onClick={() => {
              onClick(currentPage - 1);
            }}
          >
            <FaChevronLeft />
          </div>
        ) : null}
        {pages.map((item, index) => (
          <div
            className={`w-[32px] h-[32px] flex items-center justify-center  cursor-pointer select-none ${
              currentPage == item
                ? "bg-[#060822] text-[white]"
                : "hover:bg-[#060822] hover:text-[white] transition-all duration-[0.5s] bg-white"
            } shadow rounded-full `}
            onClick={() => {
              onClick(item);
            }}
            key={index}
          >
            {item}
          </div>
        ))}
        {currentPage + 1 <= totalPage && (
          <div
            className={`w-[32px] h-[32px] flex items-center justify-center  cursor-pointer select-none hover:bg-[#060822] hover:text-[white] transition-all duration-[0.5s] bg-white
         shadow rounded-full `}
            onClick={() => {
              onClick(currentPage + 1);
            }}
          >
            <FaChevronRight />
          </div>
        )}
      </div>
    )
  );
};

export default Pagination;
