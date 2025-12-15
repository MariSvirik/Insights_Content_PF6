import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Badge,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Checkbox,
    Dropdown,
    DropdownItem,
    DropdownList,
    Flex,
    FlexItem,
    MenuToggle,
    MenuToggleElement,
    Pagination,
    PaginationVariant,
    SearchInput,
    Tab,
    TabTitleText,
    Tabs,
    Title,
    Toolbar,
    ToolbarContent,
    ToolbarItem
} from '@patternfly/react-core';
import {
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr
} from '@patternfly/react-table';
import {
    ISortBy,
    SortByDirection,
} from '@patternfly/react-table';
import {
    TagIcon
} from '@patternfly/react-icons';

// System interface for the template detail page
interface System {
    id: string;
    name: string;
    tags: string[];
    os: string;
    workspace: string;
    installableAdvisories: number;
    applicableAdvisories: number;
    lastSeen: string;
}

const generateSystemData = (): System[] => {
    const systems = [
        { name: 'joe-jenkins-tasks-rhel-89-prod', tags: [], os: 'RHEL 8.9', workspace: 'Ungrouped Hosts', installableAdvisories: 2, applicableAdvisories: 290, lastSeen: '7 hours ago' },
        { name: 'web-server-01.example.com', tags: ['production', 'web'], os: 'RHEL 9.2', workspace: 'Production Servers', installableAdvisories: 5, applicableAdvisories: 142, lastSeen: '2 hours ago' },
        { name: 'db-primary-rhel8', tags: ['database', 'critical'], os: 'RHEL 8.8', workspace: 'Database Cluster', installableAdvisories: 12, applicableAdvisories: 87, lastSeen: '1 hour ago' },
        { name: 'app-worker-node-03', tags: ['worker'], os: 'RHEL 9.1', workspace: 'Application Servers', installableAdvisories: 8, applicableAdvisories: 156, lastSeen: '4 hours ago' },
        { name: 'monitoring-host-beta', tags: ['monitoring', 'beta'], os: 'RHEL 8.9', workspace: 'Infrastructure', installableAdvisories: 3, applicableAdvisories: 201, lastSeen: '30 minutes ago' },
        { name: 'backup-server-02', tags: ['backup'], os: 'RHEL 9.0', workspace: 'Backup Systems', installableAdvisories: 15, applicableAdvisories: 98, lastSeen: '6 hours ago' },
        { name: 'dev-test-environment', tags: ['development', 'testing'], os: 'RHEL 8.7', workspace: 'Development', installableAdvisories: 0, applicableAdvisories: 67, lastSeen: '1 day ago' },
        { name: 'load-balancer-01', tags: ['network', 'production'], os: 'RHEL 9.2', workspace: 'Network Infrastructure', installableAdvisories: 4, applicableAdvisories: 123, lastSeen: '3 hours ago' },
    ];

    return systems.map((system, index) => ({
        id: `system-${index + 1}`,
        ...system
    }));
};

const TemplateDetail: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const { templateName } = useParams<{ templateName: string }>();

    // Mock template data
    const templateData = {
        name: templateName || 'Production Security Updates',
        tags: [
            { label: 'el8', count: 0 },
            { label: 'x86_64', count: 1 }
        ],
        snapshotDate: '21 Mar 2024',
        createdBy: 'insights-qa',
        created: '04 Mar 2025',
        lastEdited: '04 Mar 2025',
        lastEditedBy: 'insights-qa'
    };

    // Systems state
    const [systems] = useState<System[]>(generateSystemData());
    const [systemSearchValue, setSystemSearchValue] = useState('');
    const [systemSortBy, setSystemSortBy] = useState<ISortBy>({});
    const [systemPage, setSystemPage] = useState(1);
    const [systemPerPage, setSystemPerPage] = useState(20);
    const [activeTab, setActiveTab] = useState('systems');
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
    const [isBulkSelectOpen, setIsBulkSelectOpen] = useState(false);

    // Filter and sort systems
    const filteredAndSortedSystems = useMemo(() => {
        let filtered = systems;

        if (systemSearchValue) {
            filtered = systems.filter(system =>
                system.name.toLowerCase().includes(systemSearchValue.toLowerCase())
            );
        }

        if (systemSortBy.index !== undefined) {
            filtered = [...filtered].sort((a, b) => {
                const aValue = systemSortBy.index === 0 ? a.name :
                    systemSortBy.index === 1 ? a.tags.join(', ') :
                        systemSortBy.index === 2 ? a.os :
                            systemSortBy.index === 3 ? a.workspace :
                                systemSortBy.index === 4 ? a.installableAdvisories :
                                    systemSortBy.index === 5 ? a.applicableAdvisories :
                                        a.lastSeen;

                const bValue = systemSortBy.index === 0 ? b.name :
                    systemSortBy.index === 1 ? b.tags.join(', ') :
                        systemSortBy.index === 2 ? b.os :
                            systemSortBy.index === 3 ? b.workspace :
                                systemSortBy.index === 4 ? b.installableAdvisories :
                                    systemSortBy.index === 5 ? b.applicableAdvisories :
                                        b.lastSeen;

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return systemSortBy.direction === SortByDirection.asc ? aValue - bValue : bValue - aValue;
                }

                const aStr = String(aValue);
                const bStr = String(bValue);

                return systemSortBy.direction === SortByDirection.asc
                    ? aStr.localeCompare(bStr)
                    : bStr.localeCompare(aStr);
            });
        }

        return filtered;
    }, [systems, systemSearchValue, systemSortBy]);

    // Pagination
    const paginatedSystems = useMemo(() => {
        const startIdx = (systemPage - 1) * systemPerPage;
        return filteredAndSortedSystems.slice(startIdx, startIdx + systemPerPage);
    }, [filteredAndSortedSystems, systemPage, systemPerPage]);

    const getSystemSortParams = useCallback((columnIndex: number) => ({
        sort: {
            sortBy: systemSortBy,
            onSort: (_event: any, index: number, direction: SortByDirection) => {
                setSystemSortBy({ index, direction });
            },
            columnIndex
        }
    }), [systemSortBy]);

    const onSystemSearchChange = useCallback((_event: React.FormEvent<HTMLInputElement>, value: string) => {
        setSystemSearchValue(value);
        setSystemPage(1);
    }, []);

    // Bulk selection handlers
    const onSystemSelect = useCallback((systemId: string, isSelected: boolean) => {
        setSelectedSystems(prev =>
            isSelected
                ? [...prev, systemId]
                : prev.filter(id => id !== systemId)
        );
    }, []);

    const selectAllSystems = useCallback(() => {
        setSelectedSystems(paginatedSystems.map(system => system.id));
    }, [paginatedSystems]);

    const selectNone = useCallback(() => {
        setSelectedSystems([]);
    }, []);

    const areAllSystemsSelected = paginatedSystems.length > 0 && selectedSystems.length === paginatedSystems.length;

    const systemsToolbar = (
        <Toolbar id="systems-toolbar">
            <ToolbarContent>
                <ToolbarItem>
                    <Dropdown
                        isOpen={isBulkSelectOpen}
                        onSelect={() => setIsBulkSelectOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsBulkSelectOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                                ref={toggleRef}
                                onClick={() => setIsBulkSelectOpen(!isBulkSelectOpen)}
                                isExpanded={isBulkSelectOpen}
                            >
                                <Checkbox
                                    id="bulk-select-checkbox"
                                    isChecked={areAllSystemsSelected}
                                    onChange={(checked) => {
                                        if (checked) {
                                            selectAllSystems();
                                        } else {
                                            selectNone();
                                        }
                                    }}
                                    aria-label="Select all systems"
                                    style={{ marginRight: '8px' }}
                                />
                                {selectedSystems.length > 0 ? `${selectedSystems.length} selected` : 'Select'}
                            </MenuToggle>
                        )}
                    >
                        <DropdownList>
                            <DropdownItem key="select-none" onClick={selectNone}>
                                Select none
                            </DropdownItem>
                            <DropdownItem key="select-page" onClick={selectAllSystems}>
                                Select page ({paginatedSystems.length} items)
                            </DropdownItem>
                            <DropdownItem key="select-all" onClick={() => setSelectedSystems(filteredAndSortedSystems.map(s => s.id))}>
                                Select all ({filteredAndSortedSystems.length} items)
                            </DropdownItem>
                        </DropdownList>
                    </Dropdown>
                </ToolbarItem>
                <ToolbarItem>
                    <SearchInput
                        placeholder="Filter by name"
                        value={systemSearchValue}
                        onChange={onSystemSearchChange}
                        onClear={() => {
                            setSystemSearchValue('');
                            setSystemPage(1);
                        }}
                        style={{ minWidth: '250px' }}
                    />
                </ToolbarItem>
                <ToolbarItem>
                    <Button variant="primary" isDisabled={selectedSystems.length === 0}>
                        Plan remediation
                    </Button>
                </ToolbarItem>
                <ToolbarItem>
                    <Button variant="secondary">Assign template to systems</Button>
                </ToolbarItem>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                    <Pagination
                        itemCount={filteredAndSortedSystems.length}
                        widgetId="systems-pagination-top"
                        perPage={systemPerPage}
                        page={systemPage}
                        variant={PaginationVariant.top}
                        onSetPage={(_event, newPage) => setSystemPage(newPage)}
                        onPerPageSelect={(_event, newPerPage) => {
                            setSystemPerPage(newPerPage);
                            setSystemPage(1);
                        }}
                        isCompact
                    />
                </ToolbarItem>
            </ToolbarContent>
        </Toolbar>
    );

    return (
        <div style={{ padding: '24px', backgroundColor: 'var(--pf-t--global--background--color--primary)' }}>
            <Breadcrumb>
                <BreadcrumbItem>
                    <Button
                        variant="link"
                        isInline
                        onClick={() => navigate('/content-management')}
                        style={{ padding: 0, fontSize: 'inherit' }}
                    >
                        Content
                    </Button>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <Button
                        variant="link"
                        isInline
                        onClick={() => navigate('/content-management')}
                        style={{ padding: 0, fontSize: 'inherit' }}
                    >
                        Templates
                    </Button>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{templateData.name}</BreadcrumbItem>
            </Breadcrumb>

            <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }}>
                            <FlexItem>
                                <Title headingLevel="h1" size="2xl">
                                    {templateData.name}
                                </Title>
                            </FlexItem>
                            {templateData.tags.map((tag, index) => (
                                <FlexItem key={index}>
                                    <Badge style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <TagIcon style={{ fontSize: '12px' }} />
                                        {tag.label}
                                        <span style={{
                                            marginLeft: '4px',
                                            backgroundColor: 'var(--pf-t--global--background--color--secondary)',
                                            borderRadius: '4px',
                                            padding: '0 4px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {tag.count}
                                        </span>
                                    </Badge>
                                </FlexItem>
                            ))}
                        </Flex>
                    </FlexItem>
                    <FlexItem align={{ default: 'alignRight' }}>
                        <Dropdown
                            isOpen={isActionsOpen}
                            onSelect={() => setIsActionsOpen(false)}
                            onOpenChange={(isOpen: boolean) => setIsActionsOpen(isOpen)}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle
                                    ref={toggleRef}
                                    aria-label="Actions dropdown"
                                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                                    isExpanded={isActionsOpen}
                                >
                                    Actions
                                </MenuToggle>
                            )}
                        >
                            <DropdownList>
                                <DropdownItem key="integrate-cli">Integrate via CLI</DropdownItem>
                                <DropdownItem key="edit">Edit</DropdownItem>
                                <DropdownItem key="delete">Delete</DropdownItem>
                            </DropdownList>
                        </Dropdown>
                    </FlexItem>
                </Flex>

                <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    <Flex>
                        <FlexItem flex={{ default: 'flex_1' }}>
                            <div>Snapshot date: {templateData.snapshotDate}</div>
                            <div>Created by: {templateData.createdBy}</div>
                            <div>Created: {templateData.created}</div>
                        </FlexItem>
                        <FlexItem flex={{ default: 'flex_1' }}>
                            <div>Last edited: {templateData.lastEdited}</div>
                            <div>Last edited by: {templateData.lastEditedBy}</div>
                        </FlexItem>
                    </Flex>
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                onSelect={(_event, tabIndex) => setActiveTab(tabIndex as string)}
                style={{ marginBottom: '24px' }}
            >
                <Tab eventKey="content" title={<TabTitleText>Content</TabTitleText>}>
                    <div style={{ padding: '16px' }}>
                        <p>Content tab content goes here...</p>
                    </div>
                </Tab>
                <Tab eventKey="systems" title={<TabTitleText>Systems</TabTitleText>}>
                    <div>
                        {systemsToolbar}

                        <Table aria-label="Systems table">
                            <Thead>
                                <Tr>
                                    <Th></Th>
                                    <Th {...getSystemSortParams(0)}>Name</Th>
                                    <Th {...getSystemSortParams(1)}>Tags</Th>
                                    <Th {...getSystemSortParams(2)}>OS</Th>
                                    <Th {...getSystemSortParams(3)}>Workspace</Th>
                                    <Th {...getSystemSortParams(4)}>Installable advisories</Th>
                                    <Th {...getSystemSortParams(5)}>Applicable advisories</Th>
                                    <Th {...getSystemSortParams(6)}>Last seen</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {paginatedSystems.map((system) => (
                                    <Tr key={system.id}>
                                        <Td>
                                            <Checkbox
                                                id={`checkbox-${system.id}`}
                                                isChecked={selectedSystems.includes(system.id)}
                                                onChange={(event) => onSystemSelect(system.id, event.currentTarget.checked)}
                                                aria-label={`Select ${system.name}`}
                                            />
                                        </Td>
                                        <Td dataLabel="Name">
                                            <a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                                {system.name}
                                            </a>
                                        </Td>
                                        <Td dataLabel="Tags">
                                            {system.tags.length > 0 ? (
                                                system.tags.map((tag, index) => (
                                                    <Badge key={index} style={{ marginRight: '4px' }}>{tag}</Badge>
                                                ))
                                            ) : (
                                                <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>—</span>
                                            )}
                                        </Td>
                                        <Td dataLabel="OS">{system.os}</Td>
                                        <Td dataLabel="Workspace">
                                            <a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                                {system.workspace}
                                            </a>
                                        </Td>
                                        <Td dataLabel="Installable advisories">
                                            <a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                                {system.installableAdvisories}
                                            </a>
                                        </Td>
                                        <Td dataLabel="Applicable advisories">{system.applicableAdvisories}</Td>
                                        <Td dataLabel="Last seen">{system.lastSeen}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>

                        <div style={{ marginTop: '16px' }}>
                            <Pagination
                                itemCount={filteredAndSortedSystems.length}
                                widgetId="systems-pagination-bottom"
                                perPage={systemPerPage}
                                page={systemPage}
                                variant={PaginationVariant.bottom}
                                onSetPage={(_event, newPage) => setSystemPage(newPage)}
                                onPerPageSelect={(_event, newPerPage) => {
                                    setSystemPerPage(newPerPage);
                                    setSystemPage(1);
                                }}
                            />
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default TemplateDetail; 