interface ButtonLinkProps {
  name?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Button = (props: ButtonLinkProps) => {
  return (
    <div
      onClick={() => (props.disabled == true ? null : props.onClick() ?? null)}
      className={`${
        props.disabled == true
          ? "bg-[#cccccc]"
          : "bg-[linear-gradient(to_right,#6A49EB,#4245EA,#1B6CF6)]  cursor-pointer"
      } inline-block select-none p-4 px-6 rounded-full text-white transition-all duration-500 ${
        props.className
      }`}
    >
      {props?.name}
    </div>
  );
};

export default Button;
