import {
    LayoutGrid,
    ShoppingCart,
    ListChecks,
    Users,
    TrendingUp,
    Receipt,
    ArrowDownUp,
    Tags,
    Building2,
} from 'lucide-react';

import { Link, usePage } from '@inertiajs/react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

const navigationItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Sales',
        href: '/sales',
        icon: ShoppingCart,
    },
    {
        title: 'Sale Statuses',
        href: '/sale-statuses',
        icon: ListChecks,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Users,
    },
    {
        title: 'Income',
        href: '/income',
        icon: TrendingUp,
    },
    {
        title: 'Expenses',
        href: '/expenses',
        icon: Receipt,
    },
    {
        title: 'Operations',
        href: '/operations',
        icon: ArrowDownUp,
    },
    {
        title: 'Categories',
        href: '/categories',
        icon: Tags,
    },
    {
        title: 'Business',
        href: '/businesses',
        icon: Building2,
    },
];

export function AppSidebar() {
    const { url } = usePage();

    const isActive = (
        href: string,
    ): boolean => {
        if (href === '/dashboard') {
            return url === '/dashboard';
        }

        return (
            url === href ||
            url.startsWith(`${href}/`)
        );
    };

    return (
        <Sidebar
            variant="sidebar"
            collapsible="icon"
        >
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Platform
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map(
                                (item) => (
                                    <SidebarMenuItem
                                        key={item.title}
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(
                                                item.href,
                                            )}
                                            tooltip={
                                                item.title
                                            }
                                        >
                                            <Link
                                                href={
                                                    item.href
                                                }
                                            >
                                                <item.icon />

                                                <span>
                                                    {
                                                        item.title
                                                    }
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ),
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}