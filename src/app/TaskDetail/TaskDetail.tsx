import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  AlertVariant,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  MenuToggle,
  PageSection,
  Progress,
  ProgressVariant,
  Tab,
  Tabs,
  Title
} from '@patternfly/react-core';
import { EllipsisVIcon, ExclamationCircleIcon, SyncIcon } from '@patternfly/react-icons';

const SAMPLE_ERROR =
  "The single-table inheritance mechanism failed to locate the subclass: 'Setting::RhCloud'. " +
  "This error is raised because the column 'category' is reserved for storing the class in case of inheritance. " +
  "Please rename this column if you didn't intend it to be used for storing the inheritance class or overwrite Setting.inheritance_column to use another column for that information.";

export const TaskDetail: React.FunctionComponent = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [activeTab, setActiveTab] = useState<string | number>(0);
  const [isKebabOpen, setIsKebabOpen] = useState(false);

  const taskName = 'Refresh Alternate Content Source refresh alternate content source';
  const taskState = 'Failed';

  const onTabSelect = (_: React.MouseEvent, key: string | number) => setActiveTab(key);

  const kebabDropdownItems = [
    <DropdownItem key="copy">Copy link</DropdownItem>,
    <DropdownItem key="cancel">Cancel task</DropdownItem>
  ];

  return (
    <>
      <PageSection variant="default">
        <Breadcrumb>
          <BreadcrumbItem to="/tasks" component={Link}>
            Tasks
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{taskName}</BreadcrumbItem>
        </Breadcrumb>

        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
          <Flex>
            <Title headingLevel="h1" size="2xl">
              {taskName}
            </Title>
            {taskState === 'Failed' && (
              <ExclamationCircleIcon
                className="pf-v6-u-ml-sm"
                style={{ color: 'var(--pf-v6-global--danger-color--100)', flexShrink: 0 }}
                aria-hidden
              />
            )}
          </Flex>
          <Flex>
            <Button variant="primary" icon={<SyncIcon />}>
              Auto reload
            </Button>
            <Button variant="secondary" className="pf-v6-u-ml-sm">
              Dynflow console
            </Button>
            <Dropdown
              isOpen={isKebabOpen}
              onOpenChange={(open) => setIsKebabOpen(open)}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  variant="plain"
                  onClick={() => setIsKebabOpen(!isKebabOpen)}
                  aria-label="Task actions"
                  icon={<EllipsisVIcon />}
                />
              )}
            >
              <DropdownList>{kebabDropdownItems}</DropdownList>
            </Dropdown>
          </Flex>
        </Flex>

        <DescriptionList className="pf-v6-u-mt-lg" isHorizontal horizontalTermWidthModifier={{ default: '12ch' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>Triggered by</DescriptionListTerm>
            <DescriptionListDescription>admin</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Label</DescriptionListTerm>
            <DescriptionListDescription>Actions::BulkAction</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Execution type</DescriptionListTerm>
            <DescriptionListDescription>Immediate</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Id</DescriptionListTerm>
            <DescriptionListDescription>{taskId || '—'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>State</DescriptionListTerm>
            <DescriptionListDescription>{taskState}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Started at</DescriptionListTerm>
            <DescriptionListDescription>09:15 UTC, 06 March 2023</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Ended at</DescriptionListTerm>
            <DescriptionListDescription>09:15 UTC, 06 March 2023</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>

        <div className="pf-v6-u-mt-lg">
          <Progress
            value={100}
            title="100%"
            variant={ProgressVariant.danger}
            measureLocation="outside"
            aria-label="Task progress"
          />
        </div>

        {taskState === 'Failed' && (
          <Alert
            variant={AlertVariant.danger}
            title="Error"
            className="pf-v6-u-mt-lg"
            isInline
          >
            {SAMPLE_ERROR}
          </Alert>
        )}

        <Tabs activeKey={activeTab} onSelect={onTabSelect} className="pf-v6-u-mt-lg">
          <Tab
            eventKey={0}
            title={
              <span>
                Execution details
                {taskState === 'Failed' && (
                  <ExclamationCircleIcon
                    className="pf-v6-u-ml-xs"
                    style={{ color: 'var(--pf-v6-global--danger-color--100)', verticalAlign: 'middle' }}
                    aria-hidden
                  />
                )}
              </span>
            }
          >
            <PageSection isFilled>
              <Title headingLevel="h2" size="lg" className="pf-v6-u-mb-md">
                Input
              </Title>
              <pre
                className="pf-v6-u-p-md"
                style={{
                  background: 'var(--pf-v6-global--BackgroundColor--200)',
                  borderRadius: 'var(--pf-v6-global--BorderRadius--sm)',
                  overflow: 'auto'
                }}
              >
                <code>{'{}'}</code>
              </pre>

              <Title headingLevel="h2" size="lg" className="pf-v6-u-mb-md pf-v6-u-mt-lg">
                Output
              </Title>
              <pre
                className="pf-v6-u-p-md"
                style={{
                  background: 'var(--pf-v6-global--BackgroundColor--200)',
                  borderRadius: 'var(--pf-v6-global--BorderRadius--sm)',
                  overflow: 'auto'
                }}
              >
                <code>{'{}'}</code>
              </pre>

              <Title headingLevel="h2" size="lg" className="pf-v6-u-mb-md pf-v6-u-mt-lg">
                Exception
              </Title>
              <pre
                className="pf-v6-u-p-md"
                style={{
                  background: 'var(--pf-v6-global--BackgroundColor--200)',
                  borderRadius: 'var(--pf-v6-global--BorderRadius--sm)',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                <code>ActiveRecord::SubclassNotFound: {SAMPLE_ERROR}</code>
              </pre>
            </PageSection>
          </Tab>
          <Tab eventKey={1} title="Locks">
            <PageSection isFilled>
              <p className="pf-v6-u-color-200">No locks for this task.</p>
            </PageSection>
          </Tab>
          <Tab eventKey={2} title="Raw">
            <PageSection isFilled>
              <p className="pf-v6-u-color-200">Raw task data would appear here.</p>
            </PageSection>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};
