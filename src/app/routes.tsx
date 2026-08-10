import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { ContentManagement } from '@app/ContentManagement/ContentManagement';
import { Repositories } from '@app/Repositories/Repositories';
import { ZeroContent } from '@app/ZeroContent/ZeroContent';
import TemplateDetail from '@app/TemplateDetail/TemplateDetail';
import { NotFound } from '@app/NotFound/NotFound';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '24px' }}>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

export interface IAppRoute {
  label?: string;
  element: React.ReactElement;
  exact?: boolean;
  path: string;
  title: string;
  dividerBefore?: boolean;
  routes?: undefined;
  groups?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes?: IAppRoute[];
  groups?: IAppRouteGroup[];
  dividerBefore?: boolean;
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    element: <PlaceholderPage title="Dashboard" />,
    exact: true,
    label: 'Dashboard',
    path: '/',
    title: 'PatternFly Seed | Dashboard',
  },
  {
    label: 'Inventory',
    routes: [],
  },
  {
    label: 'Content',
    routes: [
      {
        element: <ContentManagement />,
        exact: true,
        label: 'Templates',
        path: '/content-management',
        title: 'PatternFly Seed | Templates',
      },
      {
        element: <PlaceholderPage title="Advisories" />,
        exact: true,
        label: 'Advisories',
        path: '/advisories',
        title: 'PatternFly Seed | Advisories',
        dividerBefore: true,
      },
      {
        element: <PlaceholderPage title="Packages" />,
        exact: true,
        label: 'Packages',
        path: '/packages',
        title: 'PatternFly Seed | Packages',
      },
      {
        element: <Repositories />,
        exact: true,
        label: 'Repositories',
        path: '/repositories',
        title: 'PatternFly Seed | Repositories',
      },
      {
        element: <PlaceholderPage title="Systems" />,
        exact: true,
        label: 'Systems',
        path: '/systems',
        title: 'PatternFly Seed | Systems',
        dividerBefore: true,
      },
    ],
  },
  {
    label: 'Operations',
    routes: [],
  },
  {
    label: 'Security',
    routes: [],
  },
  {
    label: 'Planning',
    routes: [],
  },
  {
    label: 'Business',
    routes: [],
  },
  {
    label: 'Automation Toolkit',
    routes: [],
  },
  {
    element: <PlaceholderPage title="Registration Assistant" />,
    exact: true,
    label: 'Registration Assistant',
    path: '/registration-assistant',
    title: 'PatternFly Seed | Registration Assistant',
  },
  {
    element: <PlaceholderPage title="Learning Resources" />,
    exact: true,
    label: 'Learning Resources',
    path: '/learning-resources',
    title: 'PatternFly Seed | Learning Resources',
  },
  {
    element: <ZeroContent />,
    exact: true,
    label: 'Zero Content',
    path: '/zero-content',
    title: 'PatternFly Seed | Zero Content',
  },
  {
    element: <TemplateDetail />,
    exact: true,
    path: '/template/:templateName',
    title: 'PatternFly Seed | Template Detail',
  },
];

const flattenRoutes = (configs: AppRouteConfig[]): IAppRoute[] => {
  const result: IAppRoute[] = [];
  for (const config of configs) {
    if ('path' in config && config.path) {
      result.push(config as IAppRoute);
    }
    if ('routes' in config && config.routes) {
      result.push(...flattenRoutes(config.routes));
    }
    if ('groups' in config && config.groups) {
      for (const group of config.groups) {
        result.push(...flattenRoutes(group.routes || []));
      }
    }
  }
  return result;
};

const flattenedRoutes: IAppRoute[] = flattenRoutes(routes);

const AppRoutes = (): React.ReactElement => (
  <Routes>
    {flattenedRoutes.map(({ path, element }, idx) => (
      <Route path={path} element={element} key={idx} />
    ))}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export { AppRoutes, routes };
