import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { Support } from '@app/Support/Support';
import { GeneralSettings } from '@app/Settings/General/GeneralSettings';
import { ProfileSettings } from '@app/Settings/Profile/ProfileSettings';
import { TableDemo } from '@app/TableDemo/TableDemo';
import { ContentManagement } from '@app/ContentManagement/ContentManagement';
import { Repositories } from '@app/Repositories/Repositories';
import { ZeroContent } from '@app/ZeroContent/ZeroContent';
import TemplateDetail from '@app/TemplateDetail/TemplateDetail';
import { TaskDetail } from '@app/TaskDetail/TaskDetail';
import { Tasks } from '@app/Tasks/Tasks';
import { NotFound } from '@app/NotFound/NotFound';

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  element: React.ReactElement;
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    element: <Dashboard />,
    exact: true,
    label: 'Dashboard',
    path: '/',
    title: 'PatternFly Seed | Main Dashboard',
  },
  {
    element: <TableDemo />,
    exact: true,
    label: 'Table Demo',
    path: '/table-demo',
    title: 'PatternFly Seed | Table Demo',
  },
  {
    element: <ContentManagement />,
    exact: true,
    label: 'Content Management',
    path: '/content-management',
    title: 'PatternFly Seed | Content Management',
  },
  {
    element: <Repositories />,
    exact: true,
    path: '/repositories',
    title: 'PatternFly Seed | Repositories',
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
  {
    element: <Tasks />,
    exact: true,
    label: 'Tasks',
    path: '/tasks',
    title: 'PatternFly Seed | Tasks',
  },
  {
    element: <TaskDetail />,
    exact: true,
    path: '/task/:taskId',
    title: 'PatternFly Seed | Task Detail',
  },
  {
    element: <Support />,
    exact: true,
    label: 'Support',
    path: '/support',
    title: 'PatternFly Seed | Support Page',
  },
  {
    label: 'Settings',
    routes: [
      {
        element: <GeneralSettings />,
        exact: true,
        label: 'General',
        path: '/settings/general',
        title: 'PatternFly Seed | General Settings',
      },
      {
        element: <ProfileSettings />,
        exact: true,
        label: 'Profile',
        path: '/settings/profile',
        title: 'PatternFly Seed | Profile Settings',
      },
    ],
  },
];

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[],
);

const AppRoutes = (): React.ReactElement => (
  <Routes>
    {flattenedRoutes.map(({ path, element }, idx) => (
      <Route path={path} element={element} key={idx} />
    ))}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export { AppRoutes, routes };
