import { forwardRef, type DetailedHTMLProps, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { Virtuoso, type Components, type GridComponents } from "react-virtuoso";

import "./list-view.css";

type ListWrapperData = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type ItemTemplateFn<T> = (index: number, item: T) => ReactNode;

export interface ListViewData<T>
{
	items: T[];
	itemTemplate: ItemTemplateFn<T>;
}

function ListWrapper({ children, style, ...props }: ListWrapperData, ref: Ref<HTMLDivElement>)
{
	return (
		<div className="list-wrapper" ref={ ref } style={ style } { ...props }>
			{children}
		</div>
	);
}

function ListItemWrapper(props: ListWrapperData)
{
	return <div { ...props } className="list-item-wrapper" />
}

export default function ListView<T>({ items, itemTemplate }: ListViewData<T>)
{
	const components: Components = {
		List: forwardRef(ListWrapper),
		Item: ListItemWrapper
	};

	return (
		<Virtuoso
			components={components}
			totalCount={items.length}
			itemContent={(index) => {
				const item = items[index];
				return itemTemplate(index, item);
			}
		}/>
	);
}
