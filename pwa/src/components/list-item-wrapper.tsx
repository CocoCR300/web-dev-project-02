import type { DetailedHTMLProps, HTMLAttributes } from "react";

import "./list-item-wrapper.css";

export type ListItemWrapperData = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export default function ListItemWrapper(props: ListItemWrapperData)
{
	return <div { ...props } className="list-item-wrapper" />
}

