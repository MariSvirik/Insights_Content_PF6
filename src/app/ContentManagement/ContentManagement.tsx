import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Flex,
    FlexItem,
    MenuToggle,
    MenuToggleElement,
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
    ExclamationTriangleIcon,
    FilterIcon,
    OutlinedQuestionCircleIcon
} from '@patternfly/react-icons';

// Templates interface and data
interface Template {
    id: string;
    name: string;
    description: string;
    architecture: 'x86_64' | 'aarch64';
    version: string;
    snapshotDate: string;
    status: 'Valid' | 'Invalid';
    numberOfHosts: number;
}

const generateTemplateData = (): Template[] => {
    const templates = [
        { name: 'Production Security Updates', description: 'Security patches for production environments', architecture: 'x86_64' as const, version: 'el9', snapshotDate: 'Use latest', status: 'Valid' as const, numberOfHosts: 5 },
        { name: 'Database Server Baseline', description: 'Baseline configuration for database servers', architecture: 'aarch64' as const, version: 'el9', snapshotDate: 'Use latest', status: 'Valid' as const, numberOfHosts: 12 },
        { name: 'Web Server Standard', description: 'Standard configuration for web servers', architecture: 'x86_64' as const, version: 'el9', snapshotDate: 'Use latest', status: 'Valid' as const, numberOfHosts: 8 },
        { name: 'Development Environment', description: 'Development and testing environment template', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '06 Mar 2025', status: 'Valid' as const, numberOfHosts: 3 },
        { name: 'Infrastructure Services', description: 'Template for infrastructure and monitoring services', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '07 May 2025', status: 'Valid' as const, numberOfHosts: 15 },
        { name: 'Legacy Systems', description: 'Template for legacy system support', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '02 Mar 2025', status: 'Invalid' as const, numberOfHosts: 0 },
    ];

    return templates.map((template, index) => ({
        id: `template-${index + 1}`,
        ...template
    }));
};

const ContentManagement: React.FunctionComponent = () => {
    const navigate = useNavigate();

    // Templates state
    const [templates] = useState<Template[]>(generateTemplateData());
    const [templateSearchValue, setTemplateSearchValue] = useState('');
    const [templateSortBy, setTemplateSortBy] = useState<ISortBy>({});
    const [templatePage, setTemplatePage] = useState(1);
    const [templatePerPage, setTemplatePerPage] = useState(20);
    const [isTemplateFilterOpen, setIsTemplateFilterOpen] = useState(false);
    const [templateFilterBy, setTemplateFilterBy] = useState('Name');

    // Templates filtering and sorting
    const filteredAndSortedTemplates = useMemo(() => {
        let filtered = templates;

        if (templateSearchValue) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(templateSearchValue.toLowerCase()) ||
                template.description.toLowerCase().includes(templateSearchValue.toLowerCase())
            );
        }

        if (templateSortBy.index !== undefined) {
            const { index, direction } = templateSortBy;
            filtered = [...filtered].sort((a, b) => {
                let aValue, bValue;
                switch (index) {
                    case 0: aValue = a.name; bValue = b.name; break;
                    case 1: aValue = a.description; bValue = b.description; break;
                    case 2: aValue = a.architecture; bValue = b.architecture; break;
                    case 3: aValue = a.version; bValue = b.version; break;
                    case 4: aValue = a.snapshotDate; bValue = b.snapshotDate; break;
                    case 5: aValue = a.status; bValue = b.status; break;
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
    }, [templates, templateSearchValue, templateSortBy]);

    const paginatedTemplates = useMemo(() => {
        const startIdx = (templatePage - 1) * templatePerPage;
        return filteredAndSortedTemplates.slice(startIdx, startIdx + templatePerPage);
    }, [filteredAndSortedTemplates, templatePage, templatePerPage]);

    const getTemplateSortParams = useCallback((columnIndex: number) => {
        return {
            sort: {
                sortBy: templateSortBy,
                onSort: (_event: any, index: number, direction: 'asc' | 'desc') => {
                    setTemplateSortBy({ index, direction });
                },
                columnIndex
            }
        };
    }, [templateSortBy]);

    const StatusIcon = ({ status }: { status: 'Valid' | 'Invalid' }) => {
        if (status === 'Valid') {
            return <CheckCircleIcon style={{ color: '#3E8635' }} />;
        }
        return <ExclamationTriangleIcon style={{ color: '#C9190B' }} />;
    };

    const StatusBadge = ({ status }: { status: 'Valid' | 'Invalid' }) => {
        return (
            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                    <StatusIcon status={status} />
                </FlexItem>
                <FlexItem>
                    <span style={{
                        color: status === 'Valid' ? '#3E8635' : '#C9190B',
                        fontWeight: '600'
                    }}>
                        {status}
                    </span>
                </FlexItem>
            </Flex>
        );
    };

    const templatesToolbar = (
        <Toolbar id="templates-toolbar">
            <ToolbarContent>
                <ToolbarGroup>
                    <ToolbarItem style={{ marginRight: '0' }}>
                        <Select
                            id="template-filter-select"
                            isOpen={isTemplateFilterOpen}
                            selected={templateFilterBy}
                            onSelect={(_event, selection) => {
                                setTemplateFilterBy(selection as string);
                                setIsTemplateFilterOpen(false);
                            }}
                            onOpenChange={(isOpen) => setIsTemplateFilterOpen(isOpen)}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle ref={toggleRef} onClick={() => setIsTemplateFilterOpen(!isTemplateFilterOpen)}>
                                    <FilterIcon /> {templateFilterBy}
                                </MenuToggle>
                            )}
                        >
                            <SelectList>
                                <SelectOption value="Name">Name</SelectOption>
                                <SelectOption value="Description">Description</SelectOption>
                            </SelectList>
                        </Select>
                    </ToolbarItem>
                    <ToolbarItem style={{ marginLeft: '8px', marginRight: '0' }}>
                        <SearchInput
                            placeholder="Filter by name"
                            value={templateSearchValue}
                            onChange={(_event, value) => setTemplateSearchValue(value)}
                            onClear={() => setTemplateSearchValue('')}
                        />
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarItem>
                    <Button variant="primary">Add content template</Button>
                </ToolbarItem>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                    <Pagination
                        itemCount={filteredAndSortedTemplates.length}
                        widgetId="templates-pagination-top"
                        perPage={templatePerPage}
                        page={templatePage}
                        variant={PaginationVariant.top}
                        onSetPage={(_event, newPage) => setTemplatePage(newPage)}
                        onPerPageSelect={(_event, newPerPage) => {
                            setTemplatePerPage(newPerPage);
                            setTemplatePage(1);
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
                <BreadcrumbItem isActive>Content management</BreadcrumbItem>
            </Breadcrumb>

            <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                        <Title headingLevel="h1" size="2xl" style={{ display: 'inline' }}>
                            Content Management
                        </Title>
                        <Popover
                            headerContent="About Content Management"
                            bodyContent={
                                <div>
                                    <p>Manage templates for patching processes and repositories for content sources.</p>
                                    <p>Streamline your content delivery and maintain consistent system configurations across your infrastructure.</p>
                                    <p><a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)' }}>Learn more</a></p>
                                </div>
                            }
                            position="right"
                            enableFlip
                            appendTo={() => document.body}
                            aria-label="content-management-popover"
                            closeBtnAriaLabel="Close popover"
                        >
                            <Button variant="plain" aria-label="Help for Content Management" style={{ padding: 0, marginLeft: '4px' }}>
                                <OutlinedQuestionCircleIcon style={{ color: 'var(--pf-t--global--text--color--subtle)' }} />
                            </Button>
                        </Popover>
                    </FlexItem>
                </Flex>
                <div style={{ marginTop: '8px' }}>
                    <p style={{ color: 'var(--pf-t--global--text--color--subtle)', margin: '0 0 8px 0' }}>
                        Manage templates for patching processes and repositories for content sources.
                    </p>
                    <div>
                        <Button
                            variant="link"
                            isInline
                            onClick={() => navigate('/repositories')}
                            style={{ padding: 0 }}
                        >
                            Manage repositories
                        </Button>
                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)', marginLeft: '4px' }}>
                            for manual snapshots and custom content sources.
                        </span>
                    </div>
                </div>
            </div>

            {/* Templates Section - Primary Focus */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                            <Title headingLevel="h2" size="lg" style={{ display: 'inline' }}>Templates</Title>
                            <Popover
                                headerContent="About templates"
                                bodyContent={
                                    <div>
                                        <p>Control and filter the content delivered to your registered systems such as errata or a specific package versions.</p>
                                        <p>Establish date-based patch baselines for your systems by using content templates.</p>
                                        <p><a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)' }}>Learn more</a></p>
                                    </div>
                                }
                                position="right"
                                enableFlip
                                appendTo={() => document.body}
                                aria-label="templates-popover"
                                closeBtnAriaLabel="Close popover"
                            >
                                <Button variant="plain" aria-label="Help for Templates" style={{ padding: 0, marginLeft: '4px' }}>
                                    <OutlinedQuestionCircleIcon style={{ color: 'var(--pf-t--global--text--color--subtle)' }} />
                                </Button>
                            </Popover>
                        </FlexItem>
                    </Flex>
                </div>

                {templatesToolbar}

                <Table aria-label="Templates table">
                    <Thead>
                        <Tr>
                            <Th {...getTemplateSortParams(0)}>Name</Th>
                            <Th {...getTemplateSortParams(1)}>Description</Th>
                            <Th {...getTemplateSortParams(2)}>Architecture</Th>
                            <Th {...getTemplateSortParams(3)}>Version</Th>
                            <Th {...getTemplateSortParams(4)}>Snapshot date</Th>
                            <Th {...getTemplateSortParams(5)}>Hosts</Th>
                            <Th {...getTemplateSortParams(6)}>Status</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {paginatedTemplates.map((template) => (
                            <Tr key={template.id}>
                                <Td dataLabel="Name">
                                    <Button
                                        variant="link"
                                        isInline
                                        onClick={() => navigate(`/template/${template.name}`)}
                                        style={{ padding: 0, fontSize: 'inherit' }}
                                    >
                                        {template.name}
                                    </Button>
                                </Td>
                                <Td dataLabel="Description">{template.description}</Td>
                                <Td dataLabel="Architecture">{template.architecture}</Td>
                                <Td dataLabel="Version">{template.version}</Td>
                                <Td dataLabel="Snapshot date">{template.snapshotDate}</Td>
                                <Td dataLabel="Hosts">
                                    <a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                        {template.numberOfHosts}
                                    </a>
                                </Td>
                                <Td dataLabel="Status">
                                    <StatusBadge status={template.status} />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                <div style={{ marginTop: '16px' }}>
                    <Pagination
                        itemCount={filteredAndSortedTemplates.length}
                        widgetId="templates-pagination-bottom"
                        perPage={templatePerPage}
                        page={templatePage}
                        variant={PaginationVariant.bottom}
                        onSetPage={(_event, newPage) => setTemplatePage(newPage)}
                        onPerPageSelect={(_event, newPerPage) => {
                            setTemplatePerPage(newPerPage);
                            setTemplatePage(1);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export { ContentManagement }; 