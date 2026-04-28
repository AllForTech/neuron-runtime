import React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { Provider } from '@/app/(root)/Provider';
import {ShellHeader} from "@/components/navigation/shell-header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      <AppSidebar />
      <SidebarInset>
          <ShellHeader />
        {children}
      </SidebarInset>
    </Provider>
  );
}
