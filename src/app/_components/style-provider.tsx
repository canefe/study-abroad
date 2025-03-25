"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef, PropsWithChildren } from "react";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";

export function AntdRegistry({ children }: PropsWithChildren) {
	const cache = useRef(createCache());

	useServerInsertedHTML(() => {
		const styleText = extractStyle(cache.current);
		return <style id="antd" dangerouslySetInnerHTML={{ __html: styleText }} />;
	});

	return <StyleProvider cache={cache.current}>{children}</StyleProvider>;
}
