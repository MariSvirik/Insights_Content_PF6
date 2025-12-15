import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    AlertVariant,
    Button,
    Checkbox,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownList,
    EmptyState,
    EmptyStateActions,
    EmptyStateBody,
    MenuToggle,
    MenuToggleElement,
    Pagination,
    SearchInput,
    Select,
    SelectList,
    SelectOption,
    Skeleton,
    Tab,
    TabTitleText,
    Tabs,
    Title,
    Toolbar,
    ToolbarContent,
    ToolbarItem
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CheckIcon, EllipsisVIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';

// Package interface
interface Package {
    id: string;
    packageName: string;
    persistence: 'Persistent' | 'Transient';
    status: 'Upgradable' | 'Up-to-date';
    installedVersion: string;
    upgradableTo?: string;
}

// Generate sample data
const generateSampleData = (): Package[] => {
    const packageNames = [
        'nodejs', 'react', 'webpack', 'typescript', 'eslint', 'babel', 'prettier', 'jest',
        'lodash', 'axios', 'express', 'mongodb', 'postgresql', 'redis', 'nginx', 'docker',
        'kubernetes', 'grafana', 'prometheus', 'jenkins', 'git', 'vim', 'curl', 'wget',
        'python', 'pip', 'numpy', 'pandas', 'flask', 'django', 'mysql', 'sqlite',
        'apache', 'tomcat', 'maven', 'gradle', 'java', 'spring', 'hibernate', 'junit',
        'php', 'composer', 'laravel', 'symfony', 'ruby', 'rails', 'bundler', 'rspec',
        'go', 'rust', 'cargo'
    ];

    const data: Package[] = [];
    for (let i = 0; i < 50; i++) {
        const packageName = packageNames[i % packageNames.length];
        const major = Math.floor(Math.random() * 10) + 1;
        const minor = Math.floor(Math.random() * 20);
        const patch = Math.floor(Math.random() * 10);
        const installedVersion = `${major}.${minor}.${patch}`;

        const isUpgradable = Math.random() > 0.6;
        const upgradableTo = isUpgradable ?
            `${major}.${minor + Math.floor(Math.random() * 3) + 1}.${patch}` :
            undefined;

        data.push({
            id: `pkg-${i + 1}`,
            packageName: `${packageName}${i > packageNames.length - 1 ? `-${Math.floor(i / packageNames.length) + 1}` : ''}`,
            persistence: Math.random() > 0.5 ? 'Persistent' : 'Transient',
            status: upgradableTo ? 'Upgradable' : 'Up-to-date',
            installedVersion,
            upgradableTo
        });
    }
    return data;
};

interface SortBy {
    index: number;
    direction: 'asc' | 'desc';
}

const TableDemo: React.FC = () => {
    // State management
    const [data] = useState<Package[]>(generateSampleData());
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<SortBy>({ index: 0, direction: 'asc' });
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isLoading] = useState(false);
    const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [isBulkSelectOpen, setIsBulkSelectOpen] = useState(false);
    const [isKebabOpen, setIsKebabOpen] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

    // Tab state
    const [activePrimaryTab, setActivePrimaryTab] = useState<string | number>('overview');
    const [activeSecondaryTab, setActiveSecondaryTab] = useState<string | number>('packages');

    // Filtered and sorted data
    const filteredAndSortedData = useMemo(() => {
        let filtered = data.filter(pkg => {
            const matchesSearch = pkg.packageName.toLowerCase().includes(searchValue.toLowerCase()) ||
                pkg.installedVersion.toLowerCase().includes(searchValue.toLowerCase()) ||
                (pkg.upgradableTo && pkg.upgradableTo.toLowerCase().includes(searchValue.toLowerCase()));

            const matchesStatus = !selectedStatus || pkg.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        // Sort data
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy.index) {
                case 0: aValue = a.packageName; bValue = b.packageName; break;
                case 1: aValue = a.persistence; bValue = b.persistence; break;
                case 2: aValue = a.status; bValue = b.status; break;
                case 3: aValue = a.installedVersion; bValue = b.installedVersion; break;
                case 4: aValue = a.upgradableTo || ''; bValue = b.upgradableTo || ''; break;
                default: return 0;
            }

            if (sortBy.direction === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [data, searchValue, selectedStatus, sortBy]);

    // Paginated data
    const paginatedData = useMemo(() => {
        const startIndex = (page - 1) * perPage;
        return filteredAndSortedData.slice(startIndex, startIndex + perPage);
    }, [filteredAndSortedData, page, perPage]);

    // Selection logic
    const isAllSelected = selectedItems.size > 0 && selectedItems.size === paginatedData.length;
    const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < paginatedData.length;

    // Event handlers
    const handleSort = useCallback((_event: any, index: number, direction: 'asc' | 'desc') => {
        setSortBy({ index, direction });
    }, []);

    const handleSearch = useCallback((value: string) => {
        setSearchValue(value);
        setPage(1); // Reset to first page when searching
    }, []);

    const handleSelectAll = useCallback((isSelected: boolean) => {
        if (isSelected) {
            setSelectedItems(new Set(paginatedData.map(item => item.id)));
        } else {
            setSelectedItems(new Set());
        }
    }, [paginatedData]);

    const handleClearFilters = useCallback(() => {
        setSearchValue('');
        setSelectedStatus('');
        setPage(1);
    }, []);

    const handleStatusSelect = useCallback((_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
        setSelectedStatus(value as string);
        setIsStatusSelectOpen(false);
    }, []);

    const handleStatusToggle = useCallback(() => {
        setIsStatusSelectOpen(prev => !prev);
    }, []);

    const handleKebabToggle = useCallback(() => {
        setIsKebabOpen(prev => !prev);
    }, []);

    const handleSelectRow = useCallback((itemId: string, isSelected: boolean) => {
        const newSelection = new Set(selectedItems);
        if (isSelected) {
            newSelection.add(itemId);
        } else {
            newSelection.delete(itemId);
        }
        setSelectedItems(newSelection);
    }, [selectedItems]);

    const getSortParams = useCallback((column: string) => {
        let sortByIndex = 0;
        let sortDirection: 'asc' | 'desc' = 'asc';
        if (column === 'packageName') {
            sortByIndex = 0;
            sortDirection = sortBy.index === 0 && sortBy.direction === 'asc' ? 'desc' : 'asc';
        } else if (column === 'persistence') {
            sortByIndex = 1;
            sortDirection = sortBy.index === 1 && sortBy.direction === 'asc' ? 'desc' : 'asc';
        } else if (column === 'status') {
            sortByIndex = 2;
            sortDirection = sortBy.index === 2 && sortBy.direction === 'asc' ? 'desc' : 'asc';
        } else if (column === 'installedVersion') {
            sortByIndex = 3;
            sortDirection = sortBy.index === 3 && sortBy.direction === 'asc' ? 'desc' : 'asc';
        } else if (column === 'upgradableTo') {
            sortByIndex = 4;
            sortDirection = sortBy.index === 4 && sortBy.direction === 'asc' ? 'desc' : 'asc';
        }
        return {
            sortBy: { index: sortByIndex, direction: sortDirection },
            onSort: handleSort,
            columnIndex: sortByIndex
        };
    }, [sortBy, handleSort]);

    // Loading state
    if (isLoading) {
        return (
            <div>
                <div>
                    <Skeleton height="400px" />
                </div>
            </div>
        );
    }

    // Tab content components
    const renderOverviewContent = () => (
        <div style={{ padding: '2rem' }}>
            <Title headingLevel="h2" size="lg">Overview</Title>
            <p>System overview and summary information will be displayed here.</p>
        </div>
    );

    const renderDetailsContent = () => (
        <div style={{ padding: '2rem' }}>
            <Title headingLevel="h2" size="lg">Details</Title>
            <p>Detailed system information and specifications will be displayed here.</p>
        </div>
    );

    const renderRedHatLightspeedContent = () => (
        <div style={{ padding: '2rem' }}>
            <Title headingLevel="h2" size="lg">Red Hat Lightspeed</Title>
            <p>Red Hat Lightspeed features and integrations will be displayed here.</p>
        </div>
    );

    const renderPackagesContent = () => (
        <div>
            {/* Information Alert */}
            <Alert
                variant={AlertVariant.info}
                title="Package changes not persistent"
                style={{ marginBottom: '1rem', boxShadow: 'none' }}
            >
                To permanently install packages on this host, they must be added to the Containerfile. Otherwise, any changes will be lost on the next reboot.
            </Alert>

            {filteredAndSortedData.length === 0 ? (
                <EmptyState>
                    <EmptyStateBody>
                        <Title headingLevel="h4" size="lg">
                            No results found
                        </Title>
                        <EmptyStateActions>
                            <Button variant="link" onClick={handleClearFilters}>
                                Clear all filters
                            </Button>
                        </EmptyStateActions>
                    </EmptyStateBody>
                </EmptyState>
            ) : (
                <>
                    {/* Enhanced Toolbar */}
                    <Toolbar>
                        <ToolbarContent>
                            {/* PatternFly Bulk Selection */}
                            <ToolbarItem>
                                <Dropdown
                                    isOpen={isBulkSelectOpen}
                                    onOpenChange={setIsBulkSelectOpen}
                                    toggle={(toggleRef) => (
                                        <MenuToggle
                                            ref={toggleRef}
                                            aria-label="Bulk select"
                                        >
                                            <Checkbox
                                                id="bulk-select-dropdown"
                                                isChecked={isAllSelected ? true : isPartiallySelected ? null : false}
                                                onChange={(_event, isSelected) => handleSelectAll(isSelected)}
                                                aria-label="Select all packages"
                                            />
                                            {selectedItems.size > 0 && ` ${selectedItems.size} selected`}
                                        </MenuToggle>
                                    )}
                                >
                                    <DropdownList>
                                        <DropdownItem onClick={() => setSelectedItems(new Set())}>
                                            Select none (0 items)
                                        </DropdownItem>
                                        <DropdownItem onClick={() => setSelectedItems(new Set(paginatedData.map(item => item.id)))}>
                                            Select page ({paginatedData.length} items)
                                        </DropdownItem>
                                        <DropdownItem onClick={() => setSelectedItems(new Set(filteredAndSortedData.map(item => item.id)))}>
                                            Select all ({filteredAndSortedData.length} items)
                                        </DropdownItem>
                                    </DropdownList>
                                </Dropdown>
                            </ToolbarItem>

                            {/* Search field */}
                            <ToolbarItem>
                                <SearchInput
                                    placeholder="Search packages..."
                                    value={searchValue}
                                    onChange={(_event, value) => handleSearch(value)}
                                    onClear={() => handleSearch('')}
                                />
                            </ToolbarItem>

                            {/* Status dropdown */}
                            <ToolbarItem>
                                <Select
                                    isOpen={isStatusSelectOpen}
                                    selected={selectedStatus}
                                    onSelect={handleStatusSelect}
                                    onOpenChange={setIsStatusSelectOpen}
                                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                        <MenuToggle
                                            ref={toggleRef}
                                            onClick={handleStatusToggle}
                                            isExpanded={isStatusSelectOpen}
                                        >
                                            {selectedStatus || 'Status'}
                                        </MenuToggle>
                                    )}
                                    shouldFocusToggleOnSelect
                                >
                                    <SelectList>
                                        <SelectOption value="">All Statuses</SelectOption>
                                        <SelectOption value="Up-to-date">Up-to-date</SelectOption>
                                        <SelectOption value="Upgradable">Upgradable</SelectOption>
                                    </SelectList>
                                </Select>
                            </ToolbarItem>

                            {/* Upgrade button - enabled when items are selected */}
                            <ToolbarItem>
                                <Button variant="primary" isDisabled={selectedItems.size === 0}>
                                    Upgrade
                                </Button>
                            </ToolbarItem>

                            {/* Kebab menu */}
                            <ToolbarItem>
                                <Dropdown
                                    isOpen={isKebabOpen}
                                    onOpenChange={setIsKebabOpen}
                                    popperProps={{
                                        position: 'right',
                                        enableFlip: true,
                                        appendTo: () => document.body
                                    }}
                                    toggle={(toggleRef) => (
                                        <MenuToggle
                                            ref={toggleRef}
                                            variant="plain"
                                            aria-label="Actions"
                                            onClick={handleKebabToggle}
                                        >
                                            <EllipsisVIcon />
                                        </MenuToggle>
                                    )}
                                >
                                    <DropdownList>
                                        <DropdownItem>Export All</DropdownItem>
                                        <DropdownItem>Import Packages</DropdownItem>
                                        <Divider />
                                        <DropdownItem>Settings</DropdownItem>
                                        <DropdownItem>Refresh</DropdownItem>
                                    </DropdownList>
                                </Dropdown>
                            </ToolbarItem>

                            {/* Pagination */}
                            <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                                <Pagination
                                    itemCount={filteredAndSortedData.length}
                                    perPage={perPage}
                                    page={page}
                                    onSetPage={(_event, pageNumber) => setPage(pageNumber)}
                                    onPerPageSelect={(_event, perPageOption) => {
                                        setPerPage(perPageOption);
                                        setPage(1);
                                    }}
                                    widgetId="table-pagination-top"
                                    isCompact
                                />
                            </ToolbarItem>
                        </ToolbarContent>
                    </Toolbar>

                    {/* Table */}
                    <Table aria-label="Packages table">
                        <Thead>
                            <Tr>
                                <Th
                                    sort={getSortParams('packageName')}
                                    width={25}
                                >
                                    Package name
                                </Th>
                                <Th
                                    sort={getSortParams('persistence')}
                                    width={20}
                                >
                                    Persistence
                                </Th>
                                <Th
                                    sort={getSortParams('status')}
                                    width={20}
                                >
                                    Status
                                </Th>
                                <Th
                                    sort={getSortParams('installedVersion')}
                                    width={20}
                                >
                                    Installed version
                                </Th>
                                <Th
                                    sort={getSortParams('upgradableTo')}
                                    width={20}
                                >
                                    Upgradable to
                                </Th>
                                <Th width={10}>
                                    Actions
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {paginatedData.map((pkg) => (
                                <Tr key={pkg.id}>
                                    <Td>
                                        <Checkbox
                                            id={`select-${pkg.id}`}
                                            isChecked={selectedItems.has(pkg.id)}
                                            onChange={(_event, isSelected) => handleSelectRow(pkg.id, isSelected)}
                                            aria-label={`Select ${pkg.packageName}`}
                                        />
                                        <span style={{ marginLeft: '0.5rem' }}>
                                            {pkg.packageName}
                                        </span>
                                    </Td>
                                    <Td>{pkg.persistence}</Td>
                                    <Td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {pkg.status === 'Upgradable' ? (
                                                <LongArrowAltUpIcon style={{ color: '#0066cc' }} />
                                            ) : (
                                                <CheckIcon style={{ color: '#3e8635' }} />
                                            )}
                                            {pkg.status}
                                        </span>
                                    </Td>
                                    <Td>{pkg.installedVersion}</Td>
                                    <Td>{pkg.upgradableTo || 'N/A'}</Td>
                                    <Td>
                                        <Dropdown
                                            isOpen={openDropdowns[pkg.id] || false}
                                            onOpenChange={(isOpen) => setOpenDropdowns(prev => ({
                                                ...prev,
                                                [pkg.id]: isOpen
                                            }))}
                                            toggle={(toggleRef) => (
                                                <MenuToggle
                                                    ref={toggleRef}
                                                    variant="plain"
                                                    aria-label={`Actions for ${pkg.packageName}`}
                                                >
                                                    <EllipsisVIcon />
                                                </MenuToggle>
                                            )}
                                        >
                                            <DropdownList>
                                                <DropdownItem onClick={() => console.log('View details for', pkg.packageName)}>
                                                    View Details
                                                </DropdownItem>
                                                <DropdownItem onClick={() => console.log('Update', pkg.packageName)}>
                                                    Update
                                                </DropdownItem>
                                                <DropdownItem onClick={() => console.log('Uninstall', pkg.packageName)}>
                                                    Uninstall
                                                </DropdownItem>
                                            </DropdownList>
                                        </Dropdown>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>

                    {/* Bottom pagination */}
                    {filteredAndSortedData.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <Pagination
                                itemCount={filteredAndSortedData.length}
                                perPage={perPage}
                                page={page}
                                onSetPage={(_event, pageNumber) => setPage(pageNumber)}
                                onPerPageSelect={(_event, perPageOption) => {
                                    setPerPage(perPageOption);
                                    setPage(1);
                                }}
                                widgetId="table-pagination-bottom"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderErrataContent = () => (
        <div style={{ padding: '2rem' }}>
            <Title headingLevel="h3" size="lg">Errata</Title>
            <p>Security patches and errata information will be displayed here.</p>
        </div>
    );

    const renderModuleStreamsContent = () => (
        <div style={{ padding: '2rem' }}>
            <Title headingLevel="h3" size="lg">Module streams</Title>
            <p>Available module streams will be displayed here.</p>
        </div>
    );

    const renderRepositorySetsContent = () => (
        <div style={{ padding: '2rem' }}>
            <Title headingLevel="h3" size="lg">Repository sets</Title>
            <p>Repository configurations and sets will be displayed here.</p>
        </div>
    );

    const renderContentTabs = () => (
        <div>
            <Tabs
                activeKey={activeSecondaryTab}
                onSelect={(_event, tabIndex) => setActiveSecondaryTab(tabIndex)}
                style={{ marginBottom: '1rem' }}
            >
                <Tab
                    eventKey="packages"
                    title={<TabTitleText>Packages</TabTitleText>}
                >
                    {renderPackagesContent()}
                </Tab>
                <Tab
                    eventKey="errata"
                    title={<TabTitleText>Errata</TabTitleText>}
                >
                    {renderErrataContent()}
                </Tab>
                <Tab
                    eventKey="module-streams"
                    title={<TabTitleText>Module streams</TabTitleText>}
                >
                    {renderModuleStreamsContent()}
                </Tab>
                <Tab
                    eventKey="repository-sets"
                    title={<TabTitleText>Repository sets</TabTitleText>}
                >
                    {renderRepositorySetsContent()}
                </Tab>
            </Tabs>
        </div>
    );

    return (
        <>
            <div style={{ backgroundColor: '#f5f5f5', padding: '1rem 24px' }}>
                <Title headingLevel="h1" size="lg">
                    PowerPuffGirl3.0-Everythingnice.com
                </Title>
            </div>

            <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                {/* Primary Tabs */}
                <Tabs
                    activeKey={activePrimaryTab}
                    onSelect={(_event, tabIndex) => setActivePrimaryTab(tabIndex)}
                    style={{ marginBottom: '1rem' }}
                >
                    <Tab
                        eventKey="overview"
                        title={<TabTitleText>Overview</TabTitleText>}
                    >
                        {renderOverviewContent()}
                    </Tab>
                    <Tab
                        eventKey="details"
                        title={<TabTitleText>Details</TabTitleText>}
                    >
                        {renderDetailsContent()}
                    </Tab>
                    <Tab
                        eventKey="content"
                        title={<TabTitleText>Content</TabTitleText>}
                    >
                        {renderContentTabs()}
                    </Tab>
                    <Tab
                        eventKey="red-hat-lightspeed"
                        title={<TabTitleText>Red Hat Lightspeed</TabTitleText>}
                    >
                        {renderRedHatLightspeedContent()}
                    </Tab>
                </Tabs>
            </div>
        </>
    );
};

export { TableDemo }; 