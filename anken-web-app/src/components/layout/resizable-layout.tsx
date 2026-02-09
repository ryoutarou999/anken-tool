"use client";

import { useRef, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { AssistPanel } from "@/components/layout/assist-panel";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelRightClose, PanelRightOpen, PanelLeftOpen } from "lucide-react";
import { type PanelImperativeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

export function ResizableLayout({ children }: { children: React.ReactNode }) {
    const rightPanelRef = useRef<PanelImperativeHandle>(null);
    const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

    // 右パネルの表示切り替え
    const toggleRightPanel = () => {
        const panel = rightPanelRef.current;
        if (panel) {
            if (isRightPanelCollapsed) {
                panel.expand();
            } else {
                panel.collapse();
            }
            setIsRightPanelCollapsed(!isRightPanelCollapsed);
        }
    };

    return (
        <div className="h-screen w-full overflow-hidden bg-background">
            <ResizablePanelGroup
                orientation="horizontal"
                className="h-full w-full rounded-lg border"
            >
                {/* Left Sidebar (Min 15%, Default 20%, Max 30% - Using Strings for Percentages) */}
                <ResizablePanel
                    defaultSize="20"
                    minSize="15"
                    maxSize="30"
                    collapsible={true}
                    collapsedSize="4"
                >
                    <Sidebar />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Main Content (Flexible) */}
                <ResizablePanel defaultSize="60" minSize="30">
                    <div className="relative h-full overflow-hidden flex flex-col">
                        <div className="absolute top-4 right-4 z-10">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleRightPanel}
                                className="bg-background/80 backdrop-blur-sm shadow-sm hover:bg-accent"
                                title={isRightPanelCollapsed ? "アシストパネルを表示" : "アシストパネルを非表示"}
                            >
                                {isRightPanelCollapsed ? (
                                    <PanelRightClose className="h-4 w-4" />
                                ) : (
                                    <PanelRightOpen className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {children}
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right Assist Panel (Default 20%, Min 15%, Max 40%, Collapsible) */}
                <ResizablePanel
                    ref={rightPanelRef}
                    defaultSize="20"
                    minSize="15"
                    maxSize="40"
                    collapsible={true}
                    collapsedSize="0"
                    onCollapse={() => setIsRightPanelCollapsed(true)}
                    onExpand={() => setIsRightPanelCollapsed(false)}
                >
                    <AssistPanel />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
