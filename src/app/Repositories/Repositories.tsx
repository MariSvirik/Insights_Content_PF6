import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
    Select,
    SelectList,
    SelectOption,
    Title,
    ToggleGroup,
    ToggleGroupItem,
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
    EllipsisVIcon,
    ExclamationTriangleIcon,
    FilterIcon,
    OutlinedQuestionCircleIcon
} from '@patternfly/react-icons';

// Repositories interface and data
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

const generateRepositoryData = (): Repository[] => {
    const repositories = [
        { name: 'rhel-9-for-x86_64-baseos-rpms', url: 'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/baseos/os', architecture: 'x86_64' as const, osVersion: 'RHEL9' as const, packages: 2847, lastIntrospection: '2 hours ago', status: 'Valid' as const },
        { name: 'rhel-9-for-x86_64-appstream-rpms', url: 'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/appstream/os', architecture: 'x86_64' as const, osVersion: 'RHEL9' as const, packages: 5926, lastIntrospection: '2 hours ago', status: 'Valid' as const },
        { name: 'rhel-8-for-x86_64-baseos-rpms', url: 'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/baseos/os', architecture: 'x86_64' as const, osVersion: 'RHEL 8' as const, packages: 1789, lastIntrospection: '4 hours ago', status: 'Valid' as const },
        { name: 'rhel-8-for-x86_64-appstream-rpms', url: 'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/appstream/os', architecture: 'x86_64' as const, osVersion: 'RHEL 8' as const, packages: 3421, lastIntrospection: '4 hours ago', status: 'Valid' as const },
        { name: 'custom-epel-repository', url: 'https://download.fedoraproject.org/pub/epel/9/Everything/x86_64/', architecture: 'Any' as const, osVersion: 'Any' as const, packages: 12043, lastIntrospection: '1 day ago', status: 'Invalid' as const },
        { name: 'development-tools-repo', url: 'https://internal.company.com/repos/dev-tools/', architecture: 'x86_64' as const, osVersion: 'RHEL9' as const, packages: 567, lastIntrospection: '3 days ago', status: 'Valid' as const },
    ];

    return repositories.map((repo, index) => ({
        id: `repo-${index + 1}`,
        ...repo
    }));
};

const Repositories: React.FunctionComponent = () => {
    const navigate = useNavigate();

    // Repositories state
    const [repositories] = useState<Repository[]>(generateRepositoryData());
    const [repositorySearchValue, setRepositorySearchValue] = useState('');
    const [repositorySortBy, setRepositorySortBy] = useState<ISortBy>({});
    const [repositoryPage, setRepositoryPage] = useState(1);
    const [repositoryPerPage, setRepositoryPerPage] = useState(20);
    const [isRepositoryFilterOpen, setIsRepositoryFilterOpen] = useState(false);
    const [repositoryFilterBy, setRepositoryFilterBy] = useState('Name/URL');
    const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
    const [repositoryToggle, setRepositoryToggle] = useState('Red Hat');
    const [isBulkSelectOpen, setIsBulkSelectOpen] = useState(false);
    const [isKebabOpen, setIsKebabOpen] = useState(false);

    // Repositories filtering and sorting
    const filteredAndSortedRepositories = useMemo(() => {
        let filtered = repositories;

        if (repositorySearchValue) {
            filtered = filtered.filter(repo =>
                repo.name.toLowerCase().includes(repositorySearchValue.toLowerCase()) ||
                repo.url.toLowerCase().includes(repositorySearchValue.toLowerCase())
            );
        }

        if (repositorySortBy.index !== undefined) {
            const { index, direction } = repositorySortBy;
            filtered = [...filtered].sort((a, b) => {
                let aValue, bValue;
                switch (index) {
                    case 0: aValue = a.name; bValue = b.name; break;
                    case 1: aValue = a.architecture; bValue = b.architecture; break;
                    case 2: aValue = a.osVersion; bValue = b.osVersion; break;
                    case 3: aValue = a.packages; bValue = b.packages; break;
                    case 4: aValue = a.lastIntrospection; bValue = b.lastIntrospection; break;
                    case 5: aValue = a.status; bValue = b.status; break;
                    default: return 0;
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    const result = aValue.localeCompare(bValue);
                    return direction === SortByDirection.asc ? result : -result;
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return direction === SortByDirection.asc ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
        }

        return filtered;
    }, [repositories, repositorySearchValue, repositorySortBy]);

    const paginatedRepositories = useMemo(() => {
        const startIdx = (repositoryPage - 1) * repositoryPerPage;
        return filteredAndSortedRepositories.slice(startIdx, startIdx + repositoryPerPage);
    }, [filteredAndSortedRepositories, repositoryPage, repositoryPerPage]);

    const getRepositorySortParams = useCallback((columnIndex: number) => {
        return {
            sort: {
                sortBy: repositorySortBy,
                onSort: (_event: any, index: number, direction: 'asc' | 'desc') => {
                    setRepositorySortBy({ index, direction });
                },
                columnIndex
            }
        };
    }, [repositorySortBy]);

    const StatusIcon = ({ status }: { status: 'Valid' | 'Invalid' }) => {
        if (status === 'Valid') {
            return <CheckCircleIcon style={{ color: '#3E8635' }} />;
        }
        return <ExclamationTriangleIcon style={{ color: '#C9190B' }} />;
    };

    const StatusBadge = ({ status }: { status: 'Valid' | 'Invalid' }) => {
        const color = status === 'Valid' ? '#3E8635' : '#C9190B'; // Green for Valid, Red for Invalid
        return (
            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                    <StatusIcon status={status} />
                </FlexItem>
                <FlexItem>
                    <span style={{ color: color, fontWeight: '600' }}>
                        {status}
                    </span>
                </FlexItem>
            </Flex>
        );
    };

    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedRepositories(paginatedRepositories.map(repo => repo.id));
        } else {
            setSelectedRepositories([]);
        }
        setIsBulkSelectOpen(false);
    };

    const isAllSelected = paginatedRepositories.length > 0 && selectedRepositories.length === paginatedRepositories.length;
    const isPartiallySelected = selectedRepositories.length > 0 && selectedRepositories.length < paginatedRepositories.length;

    const repositoriesToolbar = (
        <Toolbar id="repositories-toolbar">
            <ToolbarContent>
                <ToolbarItem>
                    <Dropdown
                        isOpen={isBulkSelectOpen}
                        onOpenChange={setIsBulkSelectOpen}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                                ref={toggleRef}
                                onClick={() => setIsBulkSelectOpen(!isBulkSelectOpen)}
                                aria-label="Bulk select"
                            >
                                <Checkbox
                                    id="bulk-select-dropdown"
                                    isChecked={isAllSelected ? true : isPartiallySelected ? null : false}
                                    onChange={(_event, isSelected) => handleSelectAll(isSelected)}
                                    aria-label="Select all repositories"
                                />
                                {selectedRepositories.length > 0 && ` ${selectedRepositories.length} selected`}
                            </MenuToggle>
                        )}
                    >
                        <DropdownList>
                            <DropdownItem onClick={() => setSelectedRepositories([])}>
                                Select none (0 items)
                            </DropdownItem>
                            <DropdownItem onClick={() => setSelectedRepositories(paginatedRepositories.map(repo => repo.id))}>
                                Select page ({paginatedRepositories.length} items)
                            </DropdownItem>
                            <DropdownItem onClick={() => setSelectedRepositories(filteredAndSortedRepositories.map(repo => repo.id))}>
                                Select all ({filteredAndSortedRepositories.length} items)
                            </DropdownItem>
                        </DropdownList>
                    </Dropdown>
                </ToolbarItem>
                <ToolbarGroup>
                    <ToolbarItem style={{ marginRight: '0' }}>
                        <Select
                            id="repository-filter-select"
                            isOpen={isRepositoryFilterOpen}
                            selected={repositoryFilterBy}
                            onSelect={(_event, selection) => {
                                setRepositoryFilterBy(selection as string);
                                setIsRepositoryFilterOpen(false);
                            }}
                            onOpenChange={(isOpen) => setIsRepositoryFilterOpen(isOpen)}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle ref={toggleRef} onClick={() => setIsRepositoryFilterOpen(!isRepositoryFilterOpen)}>
                                    <FilterIcon /> {repositoryFilterBy}
                                </MenuToggle>
                            )}
                        >
                            <SelectList>
                                <SelectOption value="Name/URL">Name/URL</SelectOption>
                            </SelectList>
                        </Select>
                    </ToolbarItem>
                    <ToolbarItem style={{ marginLeft: '8px', marginRight: '0' }}>
                        <SearchInput
                            placeholder="Search repositories"
                            value={repositorySearchValue}
                            onChange={(_event, value) => setRepositorySearchValue(value)}
                            onClear={() => setRepositorySearchValue('')}
                        />
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarItem>
                    <ToggleGroup aria-label="Repository type">
                        <ToggleGroupItem
                            text="Custom"
                            isSelected={repositoryToggle === 'Custom'}
                            onChange={() => setRepositoryToggle('Custom')}
                        />
                        <ToggleGroupItem
                            text="Red Hat"
                            isSelected={repositoryToggle === 'Red Hat'}
                            onChange={() => setRepositoryToggle('Red Hat')}
                        />
                    </ToggleGroup>
                </ToolbarItem>
                <ToolbarItem>
                    <Button variant="primary">Add repositories</Button>
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
                            >
                                <EllipsisVIcon />
                            </MenuToggle>
                        )}
                    >
                        <DropdownList>
                            <DropdownItem>Remove</DropdownItem>
                        </DropdownList>
                    </Dropdown>
                </ToolbarItem>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                    <Pagination
                        itemCount={filteredAndSortedRepositories.length}
                        widgetId="repositories-pagination-top"
                        perPage={repositoryPerPage}
                        page={repositoryPage}
                        variant={PaginationVariant.top}
                        onSetPage={(_event, newPage) => setRepositoryPage(newPage)}
                        onPerPageSelect={(_event, newPerPage) => {
                            setRepositoryPerPage(newPerPage);
                            setRepositoryPage(1);
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
                <BreadcrumbItem component="button" onClick={() => navigate('/content-management')}>
                    Content management
                </BreadcrumbItem>
                <BreadcrumbItem isActive>Repositories</BreadcrumbItem>
            </Breadcrumb>

            <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                    <FlexItem>
                        <div>
                            <Flex alignItems={{ default: 'alignItemsCenter' }}>
                                <FlexItem>
                                    <Title headingLevel="h1" size="2xl" style={{ display: 'inline' }}>
                                        Repositories
                                    </Title>
                                    <OutlinedQuestionCircleIcon style={{ marginLeft: '4px', color: 'var(--pf-t--global--text--color--subtle)' }} />
                                </FlexItem>
                            </Flex>
                            <div style={{ marginTop: '8px' }}>
                                <p style={{ color: 'var(--pf-t--global--text--color--subtle)', margin: '0 0 4px 0' }}>
                                    Manage content repositories for manual snapshots and custom repository sources.
                                </p>
                                <div>
                                    <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                        To manage templates and set up content patching workflows, go to
                                    </span>
                                    <Button
                                        variant="link"
                                        isInline
                                        onClick={() => navigate('/content-management')}
                                        style={{ padding: 0, marginLeft: '4px' }}
                                    >
                                        Content Management page
                                    </Button>
                                    <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>.</span>
                                </div>
                            </div>
                        </div>
                    </FlexItem>
                </Flex>
            </div>

            {repositoriesToolbar}

            <Table aria-label="Repositories table" style={{ paddingTop: '24px' }}>
                <Thead>
                    <Tr>
                        <Th />
                        <Th {...getRepositorySortParams(0)}>Name</Th>
                        <Th {...getRepositorySortParams(1)}>Architecture</Th>
                        <Th {...getRepositorySortParams(2)}>OS version</Th>
                        <Th {...getRepositorySortParams(3)}>Packages</Th>
                        <Th {...getRepositorySortParams(4)}>Last introspection</Th>
                        <Th {...getRepositorySortParams(5)}>Status</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {paginatedRepositories.map((repository) => (
                        <Tr key={repository.id}>
                            <Td
                                select={{
                                    rowIndex: parseInt(repository.id.split('-')[1]) - 1,
                                    onSelect: (_event, isSelected) => {
                                        if (isSelected) {
                                            setSelectedRepositories(prev => [...prev, repository.id]);
                                        } else {
                                            setSelectedRepositories(prev => prev.filter(id => id !== repository.id));
                                        }
                                    },
                                    isSelected: selectedRepositories.includes(repository.id)
                                }}
                            />
                            <Td dataLabel="Name">
                                <div>
                                    <div>{repository.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                        <a href={repository.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {repository.url}
                                        </a>
                                    </div>
                                </div>
                            </Td>
                            <Td dataLabel="Architecture">{repository.architecture}</Td>
                            <Td dataLabel="OS version">{repository.osVersion}</Td>
                            <Td dataLabel="Packages">
                                <a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                    {repository.packages.toLocaleString()}
                                </a>
                            </Td>
                            <Td dataLabel="Last introspection">{repository.lastIntrospection}</Td>
                            <Td dataLabel="Status">
                                <StatusBadge status={repository.status} />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <div style={{ marginTop: '16px' }}>
                <Pagination
                    itemCount={filteredAndSortedRepositories.length}
                    widgetId="repositories-pagination-bottom"
                    perPage={repositoryPerPage}
                    page={repositoryPage}
                    variant={PaginationVariant.bottom}
                    onSetPage={(_event, newPage) => setRepositoryPage(newPage)}
                    onPerPageSelect={(_event, newPerPage) => {
                        setRepositoryPerPage(newPerPage);
                        setRepositoryPage(1);
                    }}
                />
            </div>
        </div>
    );
};

export { Repositories }; 