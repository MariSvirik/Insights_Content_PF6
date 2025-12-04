import React, { useState, useMemo, useCallback } from 'react';
import {
    Title,
    PageSection,
    Toolbar,
    ToolbarContent,
    ToolbarItem,
    ToolbarGroup,
    SearchInput,
    Pagination,
    Checkbox,
    EmptyState,
    EmptyStateBody,
    EmptyStateActions,
    Button,
    Dropdown,
    DropdownList,
    DropdownItem,
    MenuToggle,
    Select,
    SelectOption,
    SelectList,
    MenuToggleElement,
    Tabs,
    Tab,
    TabTitleText,
    ToggleGroup,
    ToggleGroupItem,
    Badge
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { EllipsisVIcon, SearchIcon, FilterIcon } from '@patternfly/react-icons';

// Repository interface
interface Repository {
    id: string;
    name: string;
    url: string;
    architecture: 'Any' | 'x86_64';
    osVersion: 'RHEL9' | 'RHEL 8' | 'Any';
    packages: number;
    lastIntrospection: string;
    status: 'Invalid' | 'Valid';
}

// Generate sample repository data
const generateRepositoryData = (): Repository[] => {
    const repositories = [
        'rhel-9-for-x86_64-baseos-rpms',
        'rhel-9-for-x86_64-appstream-rpms',
        'rhel-8-for-x86_64-baseos-rpms',
        'rhel-8-for-x86_64-appstream-rpms',
        'epel-release',
        'epel-modular',
        'centos-stream-9-baseos',
        'centos-stream-9-appstream',
        'fedora-updates',
        'fedora-release',
        'docker-ce-stable',
        'kubernetes',
        'nodejs-16',
        'python39',
        'postgresql-13',
        'mysql-8.0',
        'nginx-stable',
        'apache-httpd',
        'java-11-openjdk',
        'golang-1.19'
    ];

    const data: Repository[] = [];
    for (let i = 0; i < repositories.length; i++) {
        const repo = repositories[i];
        const architecture = Math.random() > 0.3 ? 'x86_64' : 'Any';
        const osVersions: ('RHEL9' | 'RHEL 8' | 'Any')[] = ['RHEL9', 'RHEL 8', 'Any'];
        const osVersion = osVersions[Math.floor(Math.random() * osVersions.length)];
        const packages = Math.floor(Math.random() * 5000) + 100;
        const status: ('Invalid' | 'Valid')[] = ['Valid', 'Invalid'];
        const repoStatus = Math.random() > 0.8 ? 'Invalid' : 'Valid';

        // Generate last introspection date (within last 30 days)
        const daysAgo = Math.floor(Math.random() * 30);
        const lastIntrospection = new Date();
        lastIntrospection.setDate(lastIntrospection.getDate() - daysAgo);

        data.push({
            id: `repo-${i + 1}`,
            name: repo,
            url: `https://cdn-ubi.redhat.com/content/public/${repo.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            architecture,
            osVersion,
            packages,
            lastIntrospection: lastIntrospection.toLocaleDateString(),
            status: repoStatus
        });
    }
    return data;
};

interface SortBy {
    index: number;
    direction: 'asc' | 'desc';
}

const Repositories: React.FC = () => {
    // State management
    const [activeTab, setActiveTab] = useState<string | number>('popular-repos');
    const [data] = useState<Repository[]>(generateRepositoryData());
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<SortBy>({ index: 0, direction: 'asc' });
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isDropdownOpen, setIsDropdownOpen] = useState<{ [key: string]: boolean }>({});
    const [isFilterSelectOpen, setIsFilterSelectOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string>('Name/URL');
    const [isBulkSelectOpen, setIsBulkSelectOpen] = useState(false);
    const [isKebabOpen, setIsKebabOpen] = useState(false);
    const [selectedToggle, setSelectedToggle] = useState('Custom');

    // Computed values
    const filteredData = useMemo(() => {
        return data.filter(repo =>
            repo.name.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [data, searchValue]);

    const sortedData = useMemo(() => {
        const sorted = [...filteredData];
        const { index, direction } = sortBy;

        sorted.sort((a, b) => {
            let aValue: string | number = '';
            let bValue: string | number = '';

            switch (index) {
                case 0: // Name
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 1: // Architecture
                    aValue = a.architecture;
                    bValue = b.architecture;
                    break;
                case 2: // OS Version
                    aValue = a.osVersion;
                    bValue = b.osVersion;
                    break;
                case 3: // Packages
                    aValue = a.packages;
                    bValue = b.packages;
                    break;
                case 4: // Last introspection
                    aValue = new Date(a.lastIntrospection).getTime();
                    bValue = new Date(b.lastIntrospection).getTime();
                    break;
                case 5: // Status
                    aValue = a.status;
                    bValue = b.status;
                    break;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            } else {
                return direction === 'asc'
                    ? (aValue as number) - (bValue as number)
                    : (bValue as number) - (aValue as number);
            }
        });

        return sorted;
    }, [filteredData, sortBy]);

    const paginatedData = useMemo(() => {
        const startIndex = (page - 1) * perPage;
        return sortedData.slice(startIndex, startIndex + perPage);
    }, [sortedData, page, perPage]);

    // Selection logic
    const isAllSelected = selectedItems.size === paginatedData.length && paginatedData.length > 0;
    const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < paginatedData.length;

    // Event handlers
    const handleSort = useCallback((_event: any, index: number, direction: 'asc' | 'desc') => {
        setSortBy({ index, direction });
    }, []);

    const handleSearch = useCallback((value: string) => {
        setSearchValue(value);
        setPage(1);
    }, []);

    const handleSelectAll = useCallback((isSelected: boolean) => {
        if (isSelected) {
            setSelectedItems(new Set(paginatedData.map(item => item.id)));
        } else {
            setSelectedItems(new Set());
        }
        setIsBulkSelectOpen(false);
    }, [paginatedData]);

    const handleSelectRow = useCallback((itemId: string, isSelected: boolean) => {
        const newSelection = new Set(selectedItems);
        if (isSelected) {
            newSelection.add(itemId);
        } else {
            newSelection.delete(itemId);
        }
        setSelectedItems(newSelection);
    }, [selectedItems]);

    const handleFilterSelect = useCallback((_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
        setSelectedFilter(value as string);
        setIsFilterSelectOpen(false);
    }, []);

    const handleFilterToggle = useCallback(() => {
        setIsFilterSelectOpen(!isFilterSelectOpen);
    }, [isFilterSelectOpen]);

    const handleKebabToggle = useCallback(() => {
        setIsKebabOpen(!isKebabOpen);
    }, [isKebabOpen]);

    const handleRowKebabToggle = useCallback((id: string) => {
        setIsDropdownOpen(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    }, []);

    const getSortParams = useCallback((columnIndex: number) => {
        return {
            sortBy: sortBy,
            onSort: handleSort,
            columnIndex: columnIndex
        };
    }, [sortBy, handleSort]);

    // Tab content renderers
    const renderYourRepositoriesContent = () => (
        <div style={{ paddingTop: '24px' }}>
            <div style={{ padding: '2rem' }}>
                <EmptyState>
                    <EmptyStateBody>
                        <Title headingLevel="h4" size="lg">
                            Your repositories
                        </Title>
                        <p>
                            Manage your organization's repositories and view their details.
                        </p>
                        <EmptyStateActions>
                            <Button variant="primary">
                                Add repositories
                            </Button>
                        </EmptyStateActions>
                    </EmptyStateBody>
                </EmptyState>
            </div>
        </div>
    );
    const renderPopularRepositoriesContent = () => (
        <div style={{ paddingTop: '24px' }}>
            {/* Toolbar */}
            <Toolbar>
                <ToolbarContent>
                    {/* Bulk Selection */}
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
                                        aria-label="Select all repositories"
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
                                <DropdownItem onClick={() => setSelectedItems(new Set(sortedData.map(item => item.id)))}>
                                    Select all ({sortedData.length} items)
                                </DropdownItem>
                            </DropdownList>
                        </Dropdown>
                    </ToolbarItem>

                    {/* Filter dropdown */}
                    <ToolbarItem style={{ marginRight: '0' }}>
                        <Select
                            isOpen={isFilterSelectOpen}
                            selected={selectedFilter}
                            onSelect={handleFilterSelect}
                            onOpenChange={setIsFilterSelectOpen}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle
                                    ref={toggleRef}
                                    onClick={handleFilterToggle}
                                    isExpanded={isFilterSelectOpen}
                                    icon={<FilterIcon />}
                                >
                                    {selectedFilter}
                                </MenuToggle>
                            )}
                            shouldFocusToggleOnSelect
                        >
                            <SelectList>
                                <SelectOption value="Name/URL">Name/URL</SelectOption>
                                <SelectOption value="Architecture">Architecture</SelectOption>
                                <SelectOption value="OS Version">OS Version</SelectOption>
                                <SelectOption value="Status">Status</SelectOption>
                            </SelectList>
                        </Select>
                    </ToolbarItem>

                    {/* Search input */}
                    <ToolbarItem style={{ marginLeft: '4px', marginRight: '0' }}>
                        <SearchInput
                            placeholder="Search repositories..."
                            value={searchValue}
                            onChange={(_event, value) => handleSearch(value)}
                            onClear={() => handleSearch('')}
                        />
                    </ToolbarItem>

                    {/* Toggle group */}
                    <ToolbarItem>
                        <ToggleGroup>
                            <ToggleGroupItem
                                text="Custom"
                                isSelected={selectedToggle === 'Custom'}
                                onChange={() => setSelectedToggle('Custom')}
                            />
                            <ToggleGroupItem
                                text="Red Hat"
                                isSelected={selectedToggle === 'Red Hat'}
                                onChange={() => setSelectedToggle('Red Hat')}
                            />
                        </ToggleGroup>
                    </ToolbarItem>

                    {/* Add repositories button */}
                    <ToolbarItem>
                        <Button variant="primary">
                            Add repositories
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
                                <DropdownItem>Export repositories</DropdownItem>
                                <DropdownItem>Import repositories</DropdownItem>
                                <DropdownItem>Refresh all</DropdownItem>
                                <DropdownItem>Settings</DropdownItem>
                            </DropdownList>
                        </Dropdown>
                    </ToolbarItem>

                    {/* Pagination */}
                    <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                        <Pagination
                            itemCount={sortedData.length}
                            perPage={perPage}
                            page={page}
                            onSetPage={(_event, pageNumber) => setPage(pageNumber)}
                            onPerPageSelect={(_event, newPerPage) => {
                                setPerPage(newPerPage);
                                setPage(1);
                            }}
                            widgetId="repositories-pagination"
                            isCompact
                        />
                    </ToolbarItem>
                </ToolbarContent>
            </Toolbar>

            {/* Table */}
            <Table aria-label="Repositories table">
                <Thead>
                    <Tr>
                        <Th />
                        <Th sort={getSortParams(0)}>Name</Th>
                        <Th sort={getSortParams(1)}>Architecture</Th>
                        <Th sort={getSortParams(2)}>OS version</Th>
                        <Th sort={getSortParams(3)}>Packages</Th>
                        <Th sort={getSortParams(4)}>Last introspection</Th>
                        <Th sort={getSortParams(5)}>Status</Th>
                        <Th />
                    </Tr>
                </Thead>
                <Tbody>
                    {paginatedData.map((repo) => (
                        <Tr key={repo.id}>
                            <Td>
                                <Checkbox
                                    id={`select-${repo.id}`}
                                    isChecked={selectedItems.has(repo.id)}
                                    onChange={(_event, isSelected) => handleSelectRow(repo.id, isSelected)}
                                    aria-label={`Select repository ${repo.name}`}
                                />
                            </Td>
                            <Td dataLabel="Name">
                                <div>
                                    <div>{repo.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                        <a href={repo.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {repo.url}
                                        </a>
                                    </div>
                                </div>
                            </Td>
                            <Td dataLabel="Architecture">{repo.architecture}</Td>
                            <Td dataLabel="OS version">{repo.osVersion}</Td>
                            <Td dataLabel="Packages">{repo.packages.toLocaleString()}</Td>
                            <Td dataLabel="Last introspection">{repo.lastIntrospection}</Td>
                            <Td dataLabel="Status">
                                <Badge color={repo.status === 'Valid' ? 'green' : 'red'}>
                                    {repo.status}
                                </Badge>
                            </Td>
                            <Td>
                                <Dropdown
                                    isOpen={isDropdownOpen[repo.id] || false}
                                    onOpenChange={(isOpen) => setIsDropdownOpen(prev => ({ ...prev, [repo.id]: isOpen }))}
                                    popperProps={{
                                        position: 'right',
                                        enableFlip: true,
                                        appendTo: () => document.body
                                    }}
                                    toggle={(toggleRef) => (
                                        <MenuToggle
                                            ref={toggleRef}
                                            variant="plain"
                                            aria-label={`Actions for ${repo.name}`}
                                            onClick={() => handleRowKebabToggle(repo.id)}
                                        >
                                            <EllipsisVIcon />
                                        </MenuToggle>
                                    )}
                                >
                                    <DropdownList>
                                        <DropdownItem>View details</DropdownItem>
                                        <DropdownItem>Edit repository</DropdownItem>
                                        <DropdownItem>Sync now</DropdownItem>
                                        <DropdownItem>Disable</DropdownItem>
                                        <DropdownItem>Remove</DropdownItem>
                                    </DropdownList>
                                </Dropdown>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Bottom Pagination */}
            <div style={{ padding: '1rem 0' }}>
                <Pagination
                    itemCount={sortedData.length}
                    perPage={perPage}
                    page={page}
                    onSetPage={(_event, pageNumber) => setPage(pageNumber)}
                    onPerPageSelect={(_event, newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                    }}
                    widgetId="repositories-pagination-bottom"
                />
            </div>
        </div>
    );

    return (
        <PageSection>
            <Title headingLevel="h1" size="2xl" style={{ marginBottom: '0.5rem' }}>
                Repositories
            </Title>
            <p style={{ marginBottom: '1.5rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                View all repositories within your organization.
            </p>

            <Tabs
                activeKey={activeTab}
                onSelect={(_event, tabIndex) => setActiveTab(tabIndex)}
            >
                <Tab eventKey="your-repos" title={<TabTitleText>Your repositories</TabTitleText>}>
                    {renderYourRepositoriesContent()}
                </Tab>
                <Tab eventKey="popular-repos" title={<TabTitleText>Popular repositories</TabTitleText>}>
                    {renderPopularRepositoriesContent()}
                </Tab>
            </Tabs>
        </PageSection>
    );
};

export { Repositories }; 