import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Logo = ({
  width = 24,
  height = 24,
}: {
  width?: number;
  height?: number;
}) => {
  const navigate = useNavigate();
  const [fillColor, setFillColor] = useState<string>("black");
  const sel = useSelector(
    (state: { theme: { colorPalette: string; color: string } }) => state.theme
  );

  useEffect(() => {
    setFillColor(sel.color);
  }, [sel]);

  return (
    <svg
      onClick={() => navigate("/")}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0.04199999999999804 24 23.916"
      enableBackground="new 0 0 24 24"
      x="0"
      y="0"
      height={height}
      width={width}
      className="icon-icon-0"
      data-fill-palette-color="accent"
      id="icon-0"
    >
      <g fill={fillColor} data-fill-palette-color="accent">
        <path
          d="M20 20c-0.553 0-1-0.447-1-1v-15.958c0-0.552 0.447-1 1-1s1 0.448 1 1v15.958c0 0.553-0.447 1-1 1zM20 4.042c-0.553 0-1-0.448-1-1 0-0.551-0.448-1-1-1h-15c-0.552 0-1-0.448-1-1s0.448-1 1-1h15c1.654 0 3 1.346 3 3 0 0.552-0.447 1-1 1zM21 23.958c-0.553 0-1-0.447-1-1 0-0.552 0.447-1 1-1 0.552 0 1-0.448 1-1v-0.958h-13c-0.552 0-1-0.447-1-1 0-0.552 0.448-1 1-1h14c0.553 0 1 0.448 1 1v1.958c0 1.654-1.346 3-3 3zM7 23.958c-1.654 0-3-1.346-3-3 0-0.552 0.448-1 1-1s1 0.448 1 1 0.449 1 1 1 1-0.448 1-1v-1.958c0-0.552 0.448-1 1-1s1 0.448 1 1v1.958c0 1.654-1.346 3-3 3zM21 23.958h-14c-1.654 0-3-1.346-3-3v-14.958h-3c-0.552 0-1-0.448-1-1v-1.958c0-1.654 1.346-3 3-3s3 1.346 3 3v17.917c0 0.552 0.449 1 1 1h14c0.553 0 1 0.447 1 1 0 0.551-0.447 0.999-1 0.999z m-19-19.958h2v-0.958c0-0.551-0.449-1-1-1s-1 0.449-1 1v0.958zM16 11h-7c-0.552 0-1-0.448-1-1s0.448-1 1-1h7c0.553 0 1 0.448 1 1s-0.447 1-1 1zM16 7.06h-4c-0.55 0-1-0.45-1-1s0.45-1 1-1h4c0.55 0 1 0.45 1 1s-0.45 1-1 1z m-7 0c-0.55 0-1-0.45-1-1s0.45-1 1-1 1 0.45 1 1-0.45 1-1 1zM16 15h-7c-0.552 0-1-0.447-1-1s0.448-1 1-1h7c0.553 0 1 0.447 1 1s-0.447 1-1 1z"
          fill={fillColor}
          data-fill-palette-color="accent"
        ></path>
      </g>
    </svg>
  );
};

export default Logo;
