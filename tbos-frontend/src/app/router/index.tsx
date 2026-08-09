import type { ComponentType } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BROKER_ROUTABLE_SCREENS, CONSOLE_ROUTABLE_SCREENS } from '@/registry/screens/screenRegistry';
import { RouteGuard } from '@/app/guards/RouteGuard';
import { BrokerAuthGuard } from '@/app/guards/BrokerAuthGuard';
import { ConsoleAuthGuard } from '@/app/guards/ConsoleAuthGuard';
import { AppShell } from '@/layouts/AppShell/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout/AuthLayout';
import { ConsoleShell } from '@/layouts/ConsoleShell/ConsoleShell';
import { ConsoleAuthLayout } from '@/layouts/ConsoleAuthLayout/ConsoleAuthLayout';
import { FullscreenLayout } from '@/layouts/FullscreenLayout/FullscreenLayout';
import { ScreenPlaceholder } from '@/components/screens/ScreenPlaceholder';
import { NotFoundScreen } from '@/components/screens/NotFoundScreen';
import { RootRedirect } from './RootRedirect';
import { ConsoleRootRedirect } from './ConsoleRootRedirect';
import { AiCopilotScreen } from '@/features/ai_copilot/AiCopilotScreen';
import { AiAuditLogScreen } from '@/features/ai_copilot/AiAuditLogScreen';
import { StyleGuidePage } from '@/features/style-guide/StyleGuidePage';
import { TodayScreen } from '@/features/today/TodayScreen';
import { LeadsPipelineScreen } from '@/features/leads/LeadsPipelineScreen';
import { LeadsInboxScreen } from '@/features/leads/LeadsInboxScreen';
import { LeadDetailScreen } from '@/features/leads/LeadDetailScreen';
import { NotificationCenterScreen } from '@/features/notifications/NotificationCenterScreen';
import { PropertiesListScreen } from '@/features/properties/PropertiesListScreen';
import { PropertyDetailScreen } from '@/features/properties/PropertyDetailScreen';
import { PropertyWizardScreen } from '@/features/properties/PropertyWizardScreen';
import { ProjectsListScreen } from '@/features/projects/ProjectsListScreen';
import { ProjectDetailScreen } from '@/features/projects/ProjectDetailScreen';
import { ProjectWizardScreen } from '@/features/projects/ProjectWizardScreen';
import { CustomersListScreen } from '@/features/customers/CustomersListScreen';
import { CustomerDetailScreen } from '@/features/customers/CustomerDetailScreen';
import { OwnersListScreen } from '@/features/owners/OwnersListScreen';
import { OwnerDetailScreen } from '@/features/owners/OwnerDetailScreen';
import { MarketingRequestsQueueScreen } from '@/features/owners/MarketingRequestsQueueScreen';
import { ContractsListScreen } from '@/features/contracts/ContractsListScreen';
import { ContractDetailScreen } from '@/features/contracts/ContractDetailScreen';
import { MarketingCampaignsListScreen } from '@/features/marketing/MarketingCampaignsListScreen';
import { CampaignDetailScreen } from '@/features/marketing/CampaignDetailScreen';
import { ContentQualityQueueScreen } from '@/features/marketing/ContentQualityQueueScreen';

/** Screens with real content beyond the generic placeholder — the AI
 * foundation proof (master prompt §23), the first Vertical Slice (Today →
 * Leads → Lead Detail → Lead Action → Notification, Phase 5), and the
 * Properties Vertical Slice (Phase 6). Every other routable screen renders
 * <ScreenPlaceholder> built straight from its registry entry. */
const SCREEN_OVERRIDES: Record<string, ComponentType> = {
  'AICP-01': AiCopilotScreen,
  'AICP-02': AiAuditLogScreen,
  'TODAY-01': TodayScreen,
  'LEAD-01': LeadsPipelineScreen,
  'LEAD-02': LeadsInboxScreen,
  'LEAD-03': LeadDetailScreen,
  'NOTIF-01': NotificationCenterScreen,
  'PROP-01': PropertiesListScreen,
  'PROP-02': PropertyDetailScreen,
  'PROP-03': PropertyWizardScreen,
  'PROJ-01': ProjectsListScreen,
  'PROJ-02': ProjectDetailScreen,
  'PROJ-03': ProjectWizardScreen,
  'CUST-01': CustomersListScreen,
  'CUST-02': CustomerDetailScreen,
  'OWN-01': OwnersListScreen,
  'OWN-02': OwnerDetailScreen,
  'OWN-03': MarketingRequestsQueueScreen,
  'CONT-01': ContractsListScreen,
  'CONT-02': ContractDetailScreen,
  'MKT-01': MarketingCampaignsListScreen,
  'MKT-02': CampaignDetailScreen,
  'MKT-03': ContentQualityQueueScreen,
};

/**
 * Two entirely separate route subtrees — Broker OS and Platform Console never
 * share a parent `<Route>`, a layout, or a guard, per Constitution Article V
 * and tbos-blueprint/00_IMPLEMENTATION_BLUEPRINT.md §7 item 2 ("never share a
 * route prefix, session, or login surface with any other screen"). See
 * ROUTING.md for the full rationale and BrokerAuthGuard/ConsoleAuthGuard for
 * how a session on the wrong side of the boundary is handled.
 *
 * Every <Route> is generated from the screen registry — no hand-maintained
 * route list to drift from tbos-blueprint/04_SCREEN_INVENTORY.md.
 */
export function AppRouter() {
  return (
    <Routes>
      {/* ---- Component Library dev environment — public, no auth boundary, not part
          of either Broker OS or Console (master prompt §42) ---- */}
      <Route path="/style-guide" element={<StyleGuidePage />} />

      {/* ---- Broker OS ---- */}
      <Route path="/login" element={<AuthLayout />} />
      <Route
        element={
          <BrokerAuthGuard>
            <AppShell />
          </BrokerAuthGuard>
        }
      >
        <Route index element={<RootRedirect />} />
        {BROKER_ROUTABLE_SCREENS.map((screen) => {
          const Component = SCREEN_OVERRIDES[screen.id] ?? (() => <ScreenPlaceholder screen={screen} />);
          return (
            <Route
              key={screen.id}
              path={screen.path.slice(1)}
              element={
                <RouteGuard screen={screen}>
                  <Component />
                </RouteGuard>
              }
            />
          );
        })}
      </Route>

      {/* ---- Platform Console (architecturally isolated — see ConsoleShell.tsx) ---- */}
      <Route path="/console/login" element={<ConsoleAuthLayout />} />
      <Route
        path="console"
        element={
          <ConsoleAuthGuard>
            <ConsoleShell />
          </ConsoleAuthGuard>
        }
      >
        <Route index element={<ConsoleRootRedirect />} />
        {CONSOLE_ROUTABLE_SCREENS.map((screen) => {
          const Component = SCREEN_OVERRIDES[screen.id] ?? (() => <ScreenPlaceholder screen={screen} />);
          return (
            <Route
              key={screen.id}
              path={screen.path.replace(/^\/console\//, '')}
              element={
                <RouteGuard screen={screen}>
                  <Component />
                </RouteGuard>
              }
            />
          );
        })}
      </Route>

      <Route path="*" element={<FullscreenLayout />}>
        <Route index element={<NotFoundScreen />} />
      </Route>
    </Routes>
  );
}
