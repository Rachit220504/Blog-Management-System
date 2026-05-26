import {
  LayoutDashboard,
  FileText,
  PenLine,
  SearchCheck,
  Users,
  Tags,
  Images,
  Settings,
  ListFilter,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, permission: 'dashboard:view' },
  { label: 'Blog List', path: '/posts', icon: FileText, permission: 'posts:read' },
  { label: 'Create Blog', path: '/posts/new', icon: PenLine, permission: 'posts:create' },
  { label: 'SEO Editor', path: '/seo', icon: SearchCheck, permission: 'seo:edit' },
  { label: 'Users Management', path: '/users', icon: Users, permission: 'users:read' },
  { label: 'Categories', path: '/categories', icon: ListFilter, permission: 'taxonomy:read' },
  { label: 'Tags', path: '/tags', icon: Tags, permission: 'taxonomy:read' },
  { label: 'Media Library', path: '/media', icon: Images, permission: 'media:read' },
  { label: 'Settings', path: '/settings', icon: Settings, permission: 'settings:view' },
];

export const PAGE_TITLES = {
  '/': 'Dashboard',
  '/posts': 'Blog List',
  '/posts/new': 'Create Blog',
  '/seo': 'SEO Editor',
  '/users': 'Users Management',
  '/categories': 'Categories',
  '/tags': 'Tags',
  '/media': 'Media Library',
  '/settings': 'Settings',
  '/login': 'Login',
};
