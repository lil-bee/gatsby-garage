import { Link } from "gatsby";
import React from "react";

export const CallToActionButton = ({
  destination,
  label,
  fullWidth,
  isActive,
}) => {
  return (
    <Link
      to={destination}
      className={`
      ${
        isActive
          ? "cursor-default bg-yellow-400"
          : "cursor-pointer  bg-yellow-500"
      }
      ${fullWidth ? "block w-full" : "inline-block"}
        btn`}
    >
      {label}
    </Link>
  );
};
