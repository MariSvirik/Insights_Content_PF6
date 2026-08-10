import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Divider,
    Flex,
    FlexItem,
    Icon,
    MenuToggle,
    MenuToggleElement,
    PageBreadcrumb,
    PageSection,
    Pagination,
    PaginationVariant,
    Popover,
    SearchInput,
    Select,
    SelectList,
    SelectOption,
    Title,
    Toolbar,
    ToolbarContent,
    ToolbarGroup,
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
    CheckCircleIcon,
    ExclamationCircleIcon,
    FilterIcon,
    DatabaseIcon,
    OutlinedQuestionCircleIcon,
    RedhatIcon,
    RepositoryIcon,
} from '@patternfly/react-icons';

interface Template {
    id: string;
    name: string;
    description: string;
    architecture: 'x86_64' | 'aarch64';
    osVersion: string;
    snapshotDate: string;
    hosts: number;
    status: 'Valid' | 'Invalid';
}

const generateTemplateData = (): Template[] => {
    const templates = [
        { name: 'Production Security Updates', description: 'Security patches for production environments', architecture: 'x86_64' as const, osVersion: 'RHEL 9', snapshotDate: 'Use latest', hosts: 142, status: 'Valid' as const },
        { name: 'Database Server Baseline', description: 'Baseline configuration for database servers', architecture: 'aarch64' as const, osVersion: 'RHEL 9', snapshotDate: 'Use latest', hosts: 38, status: 'Valid' as const },
        { name: 'Web Server Standard', description: 'Standard configuration for web servers', architecture: 'x86_64' as const, osVersion: 'RHEL 9', snapshotDate: 'Use latest', hosts: 215, status: 'Valid' as const },
        { name: 'Development Environment', description: 'Development and testing environment template', architecture: 'x86_64' as const, osVersion: 'RHEL 8', snapshotDate: '06 Mar 2025', hosts: 64, status: 'Valid' as const },
        { name: 'Infrastructure Services', description: 'Template for infrastructure and monitoring services', architecture: 'x86_64' as const, osVersion: 'RHEL 8', snapshotDate: '07 May 2025', hosts: 27, status: 'Valid' as const },
        { name: 'Legacy Systems', description: 'Template for legacy system support', architecture: 'x86_64' as const, osVersion: 'RHEL 8', snapshotDate: '02 Mar 2025', hosts: 12, status: 'Invalid' as const },
        { name: 'stepan-template-rhel9', description: '', architecture: 'aarch64' as const, osVersion: 'RHEL 9', snapshotDate: '07 Jan 2026', hosts: 5, status: 'Valid' as const },
        { name: 'Edge Computing Base', description: 'Minimal footprint for edge deployments', architecture: 'aarch64' as const, osVersion: 'RHEL 9', snapshotDate: '15 Apr 2025', hosts: 89, status: 'Valid' as const },
        { name: 'CI/CD Runner Template', description: 'Template for CI/CD pipeline runners', architecture: 'x86_64' as const, osVersion: 'RHEL 9', snapshotDate: 'Use latest', hosts: 31, status: 'Valid' as const },
        { name: 'SAP HANA Baseline', description: 'SAP HANA optimized template', architecture: 'x86_64' as const, osVersion: 'RHEL 8', snapshotDate: '20 Feb 2025', hosts: 8, status: 'Valid' as const },
        { name: 'Container Host Standard', description: 'Container runtime host configuration', architecture: 'x86_64' as const, osVersion: 'RHEL 9', snapshotDate: 'Use latest', hosts: 176, status: 'Valid' as const },
        { name: 'GPU Workstation', description: 'GPU-enabled workstation template', architecture: 'x86_64' as const, osVersion: 'RHEL 9', snapshotDate: '10 May 2025', hosts: 14, status: 'Valid' as const },
        { name: 'Compliance Hardened', description: 'CIS Level 2 hardened template', architecture: 'x86_64' as const, osVersion: 'RHEL 8', snapshotDate: '01 Jun 2025', hosts: 53, status: 'Valid' as const },
        { name: 'Minimal Server', description: 'Minimal server installation', architecture: 'x86_64' as const, osVersion: 'RHEL 9', snapshotDate: 'Use latest', hosts: 0, status: 'Valid' as const },
        { name: 'HPC Compute Node', description: 'High-performance computing node template', architecture: 'x86_64' as const, osVersion: 'RHEL 8', snapshotDate: '12 Mar 2025', hosts: 96, status: 'Invalid' as const },
        { name: 'DMZ Gateway', description: 'DMZ perimeter gateway template', architecture: 'x86_64' as const, osVersion: 'RHEL 9', snapshotDate: '25 Apr 2025', hosts: 7, status: 'Valid' as const },
        { name: 'Monitoring Stack', description: 'Prometheus/Grafana monitoring template', architecture: 'aarch64' as const, osVersion: 'RHEL 9', snapshotDate: 'Use latest', hosts: 19, status: 'Valid' as const },
        { name: 'Backup Server', description: 'Backup and disaster recovery server', architecture: 'x86_64' as const, osVersion: 'RHEL 8', snapshotDate: '08 Jan 2025', hosts: 3, status: 'Valid' as const },
        { name: 'Load Balancer Template', description: 'HAProxy load balancer configuration', architecture: 'x86_64' as const, osVersion: 'RHEL 9', snapshotDate: 'Use latest', hosts: 22, status: 'Valid' as const },
        { name: 'Staging Mirror', description: 'Staging environment content mirror', architecture: 'x86_64' as const, osVersion: 'RHEL 8', snapshotDate: '19 May 2025', hosts: 41, status: 'Invalid' as const },
    ];

    return templates.map((template, index) => ({
        id: `template-${index + 1}`,
        ...template
    }));
};

const ContentManagement: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const [templates] = useState<Template[]>(generateTemplateData());
    const [searchValue, setSearchValue] = useState('');
    const [sortBy, setSortBy] = useState<ISortBy>({});
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterBy, setFilterBy] = useState('Name');

    const totalCount = 523;

    const filteredAndSortedTemplates = useMemo(() => {
        let filtered = templates;

        if (searchValue) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                template.description.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        if (sortBy.index !== undefined) {
            const { index, direction } = sortBy;
            filtered = [...filtered].sort((a, b) => {
                let aValue, bValue;
                switch (index) {
                    case 0: aValue = a.name; bValue = b.name; break;
                    case 1: aValue = a.description; bValue = b.description; break;
                    case 2: aValue = a.architecture; bValue = b.architecture; break;
                    case 3: aValue = a.osVersion; bValue = b.osVersion; break;
                    case 4: aValue = a.snapshotDate; bValue = b.snapshotDate; break;
                    case 5: return sortBy.direction === SortByDirection.asc ? a.hosts - b.hosts : b.hosts - a.hosts;
                    case 6: aValue = a.status; bValue = b.status; break;
                    default: return 0;
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    const result = aValue.localeCompare(bValue);
                    return direction === SortByDirection.asc ? result : -result;
                }
                return 0;
            });
        }

        return filtered;
    }, [templates, searchValue, sortBy]);

    const paginatedTemplates = useMemo(() => {
        const startIdx = (page - 1) * perPage;
        return filteredAndSortedTemplates.slice(startIdx, startIdx + perPage);
    }, [filteredAndSortedTemplates, page, perPage]);

    const getSortParams = useCallback((columnIndex: number) => ({
        sort: {
            sortBy,
            onSort: (_event: any, index: number, direction: 'asc' | 'desc') => {
                setSortBy({ index, direction });
            },
            columnIndex
        }
    }), [sortBy]);

    const StatusDisplay = ({ status }: { status: 'Valid' | 'Invalid' }) => (
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
                <Icon status={status === 'Valid' ? 'success' : 'danger'}>
                    {status === 'Valid' ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                </Icon>
            </FlexItem>
            <FlexItem>{status}</FlexItem>
        </Flex>
    );

    return (
        <>
            <PageBreadcrumb>
                <Breadcrumb>
                    <BreadcrumbItem to="#">RHEL</BreadcrumbItem>
                    <BreadcrumbItem to="#">Content</BreadcrumbItem>
                    <BreadcrumbItem isActive>Templates</BreadcrumbItem>
                </Breadcrumb>
            </PageBreadcrumb>

            <PageSection aria-label="Templates title">
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsNone' }}>
                    <FlexItem>
                        <Title headingLevel="h1" size="2xl">Templates</Title>
                    </FlexItem>
                    <FlexItem>
                        <Popover
                            headerContent="About templates"
                            bodyContent={
                                <div>
                                    <p>Control and filter the content delivered to your registered systems such as errata or specific package versions.</p>
                                    <p>Establish date-based patch baselines for your systems by using content templates.</p>
                                </div>
                            }
                            position="right"
                        >
                            <Button variant="plain" aria-label="Help for Templates">
                                <OutlinedQuestionCircleIcon />
                            </Button>
                        </Popover>
                    </FlexItem>
                </Flex>
                <p style={{ color: '#6a6e73', fontSize: '14px', marginTop: '8px' }}>Control content stability of your system by combining repositories into templates.</p>

                <Card isCompact style={{ marginTop: '24px' }}>
                    <CardHeader>
                        <CardTitle>Available repositories</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                            <span style={{ color: '#6a6e73', fontSize: '14px' }}>View, add, or upload repositories for template creation.</span>
                            <Flex alignItems={{ default: 'alignItemsCenter' }}>
                                <FlexItem>
                                    <Button variant="link" isInline icon={<Icon isInline style={{ color: 'var(--pf-t--global--text--color--regular)' }}><RedhatIcon /></Icon>} onClick={() => navigate('/repositories?type=redhat')} style={{ fontSize: '14px' }}>
                                        2000 Red Hat repositories
                                    </Button>
                                </FlexItem>
                                <Divider orientation={{ default: 'vertical' }} style={{ alignSelf: 'center', height: '16px' }} />
                                <FlexItem>
                                    <Button variant="link" isInline icon={<Icon isInline style={{ color: 'var(--pf-t--global--text--color--regular)' }}><RepositoryIcon /></Icon>} onClick={() => navigate('/repositories?type=partner')} style={{ fontSize: '14px' }}>
                                        78 Partner repositories
                                    </Button>
                                </FlexItem>
                                <Divider orientation={{ default: 'vertical' }} style={{ alignSelf: 'center', height: '16px' }} />
                                <FlexItem>
                                    <Button variant="link" isInline icon={<Icon isInline style={{ color: 'var(--pf-t--global--text--color--regular)' }}><DatabaseIcon /></Icon>} onClick={() => navigate('/repositories?type=custom')} style={{ fontSize: '14px' }}>
                                        18 Custom repositories
                                    </Button>
                                </FlexItem>
                                <FlexItem align={{ default: 'alignRight' }}>
                                    <Button variant="secondary" onClick={() => navigate('/repositories')}>
                                        Manage repositories
                                    </Button>
                                </FlexItem>
                            </Flex>
                        </Flex>
                    </CardBody>
                </Card>
            </PageSection>

            <PageSection aria-label="Templates" isFilled>
                <Toolbar id="templates-toolbar">
                    <ToolbarContent>
                        <ToolbarGroup className="app-toolbar-filter-group">
                            <ToolbarItem>
                                <Select
                                    id="template-filter-select"
                                    isOpen={isFilterOpen}
                                    selected={filterBy}
                                    onSelect={(_event, selection) => {
                                        setFilterBy(selection as string);
                                        setIsFilterOpen(false);
                                    }}
                                    onOpenChange={(isOpen) => setIsFilterOpen(isOpen)}
                                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                        <MenuToggle ref={toggleRef} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                                            <FilterIcon /> {filterBy}
                                        </MenuToggle>
                                    )}
                                >
                                    <SelectList>
                                        <SelectOption value="Name">Name</SelectOption>
                                        <SelectOption value="Description">Description</SelectOption>
                                    </SelectList>
                                </Select>
                            </ToolbarItem>
                            <ToolbarItem>
                                <SearchInput
                                    placeholder="Find by name"
                                    value={searchValue}
                                    onChange={(_event, value) => setSearchValue(value)}
                                    onClear={() => setSearchValue('')}
                                />
                            </ToolbarItem>
                        </ToolbarGroup>
                        <ToolbarItem>
                            <Button variant="primary">Create template</Button>
                        </ToolbarItem>
                        <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                            <Pagination
                                itemCount={searchValue ? filteredAndSortedTemplates.length : totalCount}
                                widgetId="templates-pagination-top"
                                perPage={perPage}
                                page={page}
                                variant={PaginationVariant.top}
                                onSetPage={(_event, newPage) => setPage(newPage)}
                                onPerPageSelect={(_event, newPerPage) => {
                                    setPerPage(newPerPage);
                                    setPage(1);
                                }}
                                isCompact
                            />
                        </ToolbarItem>
                    </ToolbarContent>
                </Toolbar>

                <Table aria-label="Templates table">
                    <Thead>
                        <Tr>
                            <Th {...getSortParams(0)}>Name</Th>
                            <Th>Description</Th>
                            <Th {...getSortParams(2)} style={{ whiteSpace: 'nowrap' }}>Architecture</Th>
                            <Th {...getSortParams(3)} style={{ whiteSpace: 'nowrap' }}>OS version</Th>
                            <Th {...getSortParams(4)} style={{ whiteSpace: 'nowrap' }}>Snapshot date</Th>
                            <Th {...getSortParams(5)} style={{ whiteSpace: 'nowrap' }}>Hosts</Th>
                            <Th {...getSortParams(6)} style={{ whiteSpace: 'nowrap' }}>Status</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {paginatedTemplates.map((template) => (
                            <Tr key={template.id}>
                                <Td dataLabel="Name">
                                    <Button
                                        variant="link"
                                        isInline
                                        onClick={() => navigate(`/template/${encodeURIComponent(template.name)}`)}
                                    >
                                        {template.name}
                                    </Button>
                                </Td>
                                <Td dataLabel="Description">{template.description}</Td>
                                <Td dataLabel="Architecture">{template.architecture}</Td>
                                <Td dataLabel="OS version">{template.osVersion}</Td>
                                <Td dataLabel="Snapshot date">{template.snapshotDate}</Td>
                                <Td dataLabel="Hosts">{template.hosts}</Td>
                                <Td dataLabel="Status">
                                    <StatusDisplay status={template.status} />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                <Pagination
                    itemCount={searchValue ? filteredAndSortedTemplates.length : totalCount}
                    widgetId="templates-pagination-bottom"
                    perPage={perPage}
                    page={page}
                    variant={PaginationVariant.bottom}
                    onSetPage={(_event, newPage) => setPage(newPage)}
                    onPerPageSelect={(_event, newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                    }}
                />
            </PageSection>
        </>
    );
};

export { ContentManagement };
