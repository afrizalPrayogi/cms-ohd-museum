import { ReactNode } from "react";

interface ButtonLinkProps {
  name?: string;
  link?: string;
  icon?: ReactNode;
  className?: string;
  classNameContainer?: string;
}

const ButtonLink = (props: ButtonLinkProps) => {
  return (
    <div className={`flex ${props.classNameContainer}`}>
      <a
        href={props?.link}
        className={`flex items-center gap-3 bg-[linear-gradient(to_right,#6A49EB,#4245EA,#1B6CF6)] inline-block p-4 px-6 rounded-full text-white  ${props.className}`}
      >
        <div dangerouslySetInnerHTML={{ __html: props?.name ?? "" }}></div>
        {props.icon}
      </a>
    </div>
  );
};

export default ButtonLink;
