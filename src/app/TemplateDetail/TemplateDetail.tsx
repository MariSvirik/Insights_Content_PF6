import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Checkbox,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Dropdown,
    DropdownItem,
    DropdownList,
    Flex,
    FlexItem,
    Grid,
    GridItem,
    Label,
    MenuToggle,
    MenuToggleElement,
    PageBreadcrumb,
    PageSection,
    Pagination,
    PaginationVariant,
    SearchInput,
    Select,
    SelectList,
    SelectOption,
    Tab,
    TabContent,
    TabTitleText,
    Tabs,
    Title,
    Toolbar,
    ToolbarContent,
    ToolbarItem,
    Tooltip
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
    CopyIcon,
    EllipsisVIcon,
    FilterIcon,
    OutlinedClockIcon
} from '@patternfly/react-icons';

interface System {
    id: string;
    name: string;
    workspace: string;
    tags: string;
    os: string;
    lastSeen: string;
    firstImpacted: string;
}

const generateSystemData = (): System[] => [
    { id: 'sys-1', name: 'web-frontend', workspace: 'AWS', tags: 'prod', os: 'RHEL 9', lastSeen: '15 minutes ago', firstImpacted: 'Mar 1, 2025' },
    { id: 'sys-2', name: 'data-processor', workspace: 'Azure', tags: 'staging', os: 'RHEL 8', lastSeen: 'Aug 25, 2025', firstImpacted: 'Feb 12, 2025' },
    { id: 'sys-3', name: 'api-gateway', workspace: 'GCP', tags: 'prod', os: 'RHEL 10', lastSeen: '2 hours ago', firstImpacted: 'Jan 5, 2025' },
    { id: 'sys-4', name: 'batch-worker', workspace: 'Bare metal', tags: '–', os: 'RHEL 9', lastSeen: 'Yesterday', firstImpacted: 'Dec 18, 2024' },
    { id: 'sys-5', name: 'cache-service', workspace: 'AWS', tags: 'dev', os: 'RHEL 8', lastSeen: 'Mar 20, 2025', firstImpacted: 'Nov 3, 2024' },
];

interface TemplateMetadata {
    name: string;
    osLabel: string;
    archLabel: string;
    snapshotDate: string;
    createdBy: string;
    created: string;
    lastEditedBy: string;
    lastEdited: string;
}

const getTemplateMetadata = (templateName: string): TemplateMetadata => ({
    name: templateName,
    osLabel: 'RHEL 9',
    archLabel: 'aarch64',
    snapshotDate: 'Using latest content from repositories',
    createdBy: 'insights-qa',
    created: '07 Jan 2026',
    lastEditedBy: 'insights-qa',
    lastEdited: '07 Jan 2026',
});

const TemplateDetail: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const { templateName } = useParams<{ templateName: string }>();
    const decodedName = decodeURIComponent(templateName || 'stepan-template-rhel9');
    const templateData = getTemplateMetadata(decodedName);

    const [systems] = useState<System[]>(generateSystemData());
    const [searchValue, setSearchValue] = useState('');
    const [sortBy, setSortBy] = useState<ISortBy>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [activeTab, setActiveTab] = useState<string | number>(1);
    const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
    const [isBulkSelectOpen, setIsBulkSelectOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterBy, setFilterBy] = useState('Name');
    const [isKebabOpen, setIsKebabOpen] = useState(false);

    const filteredAndSortedSystems = useMemo(() => {
        let filtered = systems;

        if (searchValue) {
            filtered = systems.filter(system =>
                system.name.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        if (sortBy.index !== undefined) {
            filtered = [...filtered].sort((a, b) => {
                let aValue: string, bValue: string;
                switch (sortBy.index) {
                    case 0: aValue = a.name; bValue = b.name; break;
                    case 1: aValue = a.workspace; bValue = b.workspace; break;
                    case 2: aValue = a.tags; bValue = b.tags; break;
                    case 3: aValue = a.os; bValue = b.os; break;
                    case 4: aValue = a.lastSeen; bValue = b.lastSeen; break;
                    case 5: aValue = a.firstImpacted; bValue = b.firstImpacted; break;
                    default: return 0;
                }
                const result = aValue.localeCompare(bValue);
                return sortBy.direction === SortByDirection.asc ? result : -result;
            });
        }

        return filtered;
    }, [systems, searchValue, sortBy]);

    const paginatedSystems = useMemo(() => {
        const startIdx = (currentPage - 1) * perPage;
        return filteredAndSortedSystems.slice(startIdx, startIdx + perPage);
    }, [filteredAndSortedSystems, currentPage, perPage]);

    const getSortParams = useCallback((columnIndex: number) => ({
        sort: {
            sortBy,
            onSort: (_event: any, index: number, direction: SortByDirection) => {
                setSortBy({ index, direction });
            },
            columnIndex
        }
    }), [sortBy]);

    const onSystemSelect = useCallback((systemId: string, isSelected: boolean) => {
        setSelectedSystems(prev =>
            isSelected ? [...prev, systemId] : prev.filter(id => id !== systemId)
        );
    }, []);

    const selectAllSystems = useCallback(() => {
        setSelectedSystems(paginatedSystems.map(s => s.id));
    }, [paginatedSystems]);

    const selectNone = useCallback(() => {
        setSelectedSystems([]);
    }, []);

    const areAllSelected = paginatedSystems.length > 0 && selectedSystems.length === paginatedSystems.length;

    const systemsToolbar = (
        <Toolbar id="systems-toolbar">
            <ToolbarContent>
                <ToolbarItem>
                    <Dropdown
                        isOpen={isBulkSelectOpen}
                        onSelect={() => setIsBulkSelectOpen(false)}
                        onOpenChange={(isOpen) => setIsBulkSelectOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                                ref={toggleRef}
                                onClick={() => setIsBulkSelectOpen(!isBulkSelectOpen)}
                                isExpanded={isBulkSelectOpen}
                                splitButtonItems={[
                                    <Checkbox
                                        key="bulk-check"
                                        id="bulk-select-checkbox"
                                        isChecked={areAllSelected}
                                        onChange={(_event, checked) => checked ? selectAllSystems() : selectNone()}
                                        aria-label="Select all systems"
                                    />
                                ]}
                            >
                                {selectedSystems.length > 0 ? `${selectedSystems.length} selected` : ''}
                            </MenuToggle>
                        )}
                    >
                        <DropdownList>
                            <DropdownItem key="select-none" onClick={selectNone}>Select none</DropdownItem>
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
                    <Select
                        id="system-filter-select"
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
                            <SelectOption value="Workspace">Workspace</SelectOption>
                            <SelectOption value="OS">OS</SelectOption>
                        </SelectList>
                    </Select>
                </ToolbarItem>
                <ToolbarItem>
                    <SearchInput
                        placeholder="Filter by name"
                        value={searchValue}
                        onChange={(_event, value) => { setSearchValue(value); setCurrentPage(1); }}
                        onClear={() => { setSearchValue(''); setCurrentPage(1); }}
                    />
                </ToolbarItem>
                <ToolbarItem>
                    <Button variant="primary" isDisabled={selectedSystems.length === 0}>Plan remediation</Button>
                </ToolbarItem>
                <ToolbarItem>
                    <Tooltip content="Export">
                        <Button variant="plain" aria-label="Export">
                            <CopyIcon />
                        </Button>
                    </Tooltip>
                </ToolbarItem>
                <ToolbarItem>
                    <Dropdown
                        isOpen={isKebabOpen}
                        onOpenChange={setIsKebabOpen}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                                ref={toggleRef}
                                variant="plain"
                                onClick={() => setIsKebabOpen(!isKebabOpen)}
                                aria-label="Actions"
                            >
                                <EllipsisVIcon />
                            </MenuToggle>
                        )}
                    >
                        <DropdownList>
                            <DropdownItem>Export as CSV</DropdownItem>
                        </DropdownList>
                    </Dropdown>
                </ToolbarItem>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                    <Pagination
                        itemCount={filteredAndSortedSystems.length}
                        widgetId="systems-pagination-top"
                        perPage={perPage}
                        page={currentPage}
                        variant={PaginationVariant.top}
                        onSetPage={(_event, newPage) => setCurrentPage(newPage)}
                        onPerPageSelect={(_event, newPerPage) => {
                            setPerPage(newPerPage);
                            setCurrentPage(1);
                        }}
                        isCompact
                    />
                </ToolbarItem>
            </ToolbarContent>
        </Toolbar>
    );

    const repositoriesTabRef = React.createRef<HTMLElement>();
    const systemsTabRef = React.createRef<HTMLElement>();

    return (
        <>
            <PageBreadcrumb>
                <Breadcrumb>
                    <BreadcrumbItem to="#">RHEL</BreadcrumbItem>
                    <BreadcrumbItem>
                        <Button variant="link" isInline onClick={() => navigate('/content-management')}>
                            Content
                        </Button>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Button variant="link" isInline onClick={() => navigate('/content-management')}>
                            Templates
                        </Button>
                    </BreadcrumbItem>
                    <BreadcrumbItem isActive>{templateData.name}</BreadcrumbItem>
                </Breadcrumb>
            </PageBreadcrumb>

            <PageSection aria-label="Template detail">
                <Flex direction={{ default: 'column' }}>
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                        <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }} wrap={{ default: 'wrap' }}>
                            <FlexItem>
                                <Title headingLevel="h1" size="2xl" className="pf-v6-u-mb-0">{templateData.name}</Title>
                            </FlexItem>
                            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                <FlexItem><Label color="blue">{templateData.osLabel}</Label></FlexItem>
                                <FlexItem><Label color="blue">{templateData.archLabel}</Label></FlexItem>
                            </Flex>
                        </Flex>
                        <FlexItem>
                            <Button variant="secondary">Edit</Button>
                        </FlexItem>
                    </Flex>

                    <Grid hasGutter className="pf-v6-u-mt-sm pf-v6-u-mb-sm">
                        <GridItem span={4}>
                            <DescriptionList isCompact aria-label="Snapshot and author">
                                <DescriptionListGroup>
                                    <DescriptionListTerm>Snapshot date</DescriptionListTerm>
                                    <DescriptionListDescription>{templateData.snapshotDate}</DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                    <DescriptionListTerm>Created by</DescriptionListTerm>
                                    <DescriptionListDescription>{templateData.createdBy}</DescriptionListDescription>
                                </DescriptionListGroup>
                            </DescriptionList>
                        </GridItem>
                        <GridItem span={4}>
                            <DescriptionList isCompact aria-label="Created">
                                <DescriptionListGroup>
                                    <DescriptionListTerm>Created</DescriptionListTerm>
                                    <DescriptionListDescription>{templateData.created}</DescriptionListDescription>
                                </DescriptionListGroup>
                            </DescriptionList>
                        </GridItem>
                        <GridItem span={4}>
                            <DescriptionList isCompact aria-label="Last edited">
                                <DescriptionListGroup>
                                    <DescriptionListTerm>Last edited by</DescriptionListTerm>
                                    <DescriptionListDescription>{templateData.lastEditedBy}</DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                    <DescriptionListTerm>Last edited</DescriptionListTerm>
                                    <DescriptionListDescription>{templateData.lastEdited}</DescriptionListDescription>
                                </DescriptionListGroup>
                            </DescriptionList>
                        </GridItem>
                    </Grid>
                </Flex>
            </PageSection>

            <PageSection type="tabs" aria-label="Template tabs" isFilled>
                <Tabs
                    activeKey={activeTab}
                    onSelect={(_event, tabIndex) => setActiveTab(tabIndex)}
                    usePageInsets
                >
                    <Tab eventKey={0} title={<TabTitleText>Repositories</TabTitleText>} tabContentRef={repositoriesTabRef} />
                    <Tab eventKey={1} title={<TabTitleText>Systems</TabTitleText>} tabContentRef={systemsTabRef} />
                </Tabs>
                <TabContent eventKey={0} ref={repositoriesTabRef} hidden={activeTab !== 0}>
                    <div className="pf-v6-u-p-lg">
                        <p>Repositories linked to this template will appear here.</p>
                    </div>
                </TabContent>
                <TabContent eventKey={1} ref={systemsTabRef} hidden={activeTab !== 1} className="pf-v6-u-pt-md">
                    {systemsToolbar}

                    <Table aria-label="Systems table">
                        <Thead>
                            <Tr>
                                <Th />
                                <Th {...getSortParams(0)}>Name</Th>
                                <Th {...getSortParams(1)}>Workspace</Th>
                                <Th {...getSortParams(2)}>Tags</Th>
                                <Th {...getSortParams(3)}>OS</Th>
                                <Th {...getSortParams(4)} info={{
                                    tooltip: 'The last time a check-in was received from this system',
                                    tooltipProps: { isContentLeftAligned: true }
                                }}>
                                    Last seen{' '}
                                    <OutlinedClockIcon style={{ marginLeft: '4px', fontSize: '0.85em', verticalAlign: 'middle' }} />
                                </Th>
                                <Th {...getSortParams(5)}>First impacted</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {paginatedSystems.map((system) => (
                                <Tr key={system.id}>
                                    <Td
                                        select={{
                                            rowIndex: parseInt(system.id.split('-')[1]) - 1,
                                            onSelect: (_event, isSelected) => onSystemSelect(system.id, isSelected),
                                            isSelected: selectedSystems.includes(system.id)
                                        }}
                                    />
                                    <Td dataLabel="Name">
                                        <Button variant="link" isInline>{system.name}</Button>
                                    </Td>
                                    <Td dataLabel="Workspace">{system.workspace}</Td>
                                    <Td dataLabel="Tags">
                                        {system.tags === '–' ? (
                                            <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>–</span>
                                        ) : (
                                            system.tags
                                        )}
                                    </Td>
                                    <Td dataLabel="OS">{system.os}</Td>
                                    <Td dataLabel="Last seen">{system.lastSeen}</Td>
                                    <Td dataLabel="First impacted">{system.firstImpacted}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>

                    <Pagination
                        itemCount={filteredAndSortedSystems.length}
                        widgetId="systems-pagination-bottom"
                        perPage={perPage}
                        page={currentPage}
                        variant={PaginationVariant.bottom}
                        onSetPage={(_event, newPage) => setCurrentPage(newPage)}
                        onPerPageSelect={(_event, newPerPage) => {
                            setPerPage(newPerPage);
                            setCurrentPage(1);
                        }}
                    />
                </TabContent>
            </PageSection>
        </>
    );
};

export default TemplateDetail;
