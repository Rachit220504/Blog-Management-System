export const ROLE_PERMISSIONS = {
  super_admin: [
    'dashboard:view',
    'posts:read',
    'posts:create',
    'posts:update',
    'posts:delete',
    'posts:publish',
    'seo:edit',
    'users:read',
    'users:manage',
    'taxonomy:read',
    'taxonomy:manage',
    'media:read',
    'media:upload',
    'media:delete',
    'settings:view',
    'settings:manage',
  ],
  editor: [
    'dashboard:view',
    'posts:read',
    'posts:create',
    'posts:update',
    'posts:publish',
    'seo:edit',
    'taxonomy:read',
    'media:read',
    'media:upload',
    'settings:view',
  ],
  author: [
    'dashboard:view',
    'posts:read',
    'posts:create',
    'posts:update',
    'seo:edit',
    'media:read',
    'media:upload',
    'settings:view',
  ],
  user: ['dashboard:view', 'settings:view'],
};

export const PAGE_PERMISSIONS = {
  dashboard: 'dashboard:view',
  posts: 'posts:read',
  createBlog: 'posts:create',
  editBlog: 'posts:update',
  seoEditor: 'seo:edit',
  users: 'users:read',
  categories: 'taxonomy:read',
  tags: 'taxonomy:read',
  media: 'media:read',
  settings: 'settings:view',
};

export const getPermissionsForRole = (role) => ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;

export const hasPermission = (role, permission) => {
  if (!permission) return true;
  return getPermissionsForRole(role).includes(permission);
};
