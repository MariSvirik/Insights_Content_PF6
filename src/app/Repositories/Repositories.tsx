import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Checkbox,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownList,
    Flex,
    FlexItem,
    Icon,
    Label,
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
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    EllipsisVIcon,
    ExclamationCircleIcon,
    ExternalLinkAltIcon,
    FilterIcon,
    FolderOpenIcon,
    OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';

interface Repository {
    id: string;
    name: string;
    url: string;
    architecture: 'Any' | 'x86_64' | 'aarch64';
    osVersion: 'RHEL 9' | 'RHEL 8' | 'Any';
    packages: number;
    lastIntrospection: string;
    status: 'Invalid' | 'Valid';
    source: 'redhat' | 'custom' | 'partner';
    lastSnapshot?: string;
    changesAdded?: number;
    changesRemoved?: number;
}

const generateRepositoryData = (): Repository[] => {
    const repositories: Omit<Repository, 'id'>[] = [
        { name: 'rhel-9-for-x86_64-baseos-rpms', url: 'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/baseos/os', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 2847, lastIntrospection: '2 hours ago', status: 'Valid', source: 'redhat', lastSnapshot: '2 hours ago', changesAdded: 5, changesRemoved: 2 },
        { name: 'rhel-9-for-x86_64-appstream-rpms', url: 'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/appstream/os', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 5926, lastIntrospection: '2 hours ago', status: 'Valid', source: 'redhat', lastSnapshot: '2 hours ago', changesAdded: 12, changesRemoved: 3 },
        { name: 'rhel-8-for-x86_64-baseos-rpms', url: 'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/baseos/os', architecture: 'x86_64', osVersion: 'RHEL 8', packages: 1789, lastIntrospection: '4 hours ago', status: 'Valid', source: 'redhat' },
        { name: 'rhel-8-for-x86_64-appstream-rpms', url: 'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/appstream/os', architecture: 'x86_64', osVersion: 'RHEL 8', packages: 3421, lastIntrospection: '4 hours ago', status: 'Valid', source: 'redhat' },
        { name: 'EPEL 8 Everything aarch64', url: 'https://dl.fedoraproject.org/pub/epel/8/Everything/aarch64/', architecture: 'aarch64', osVersion: 'RHEL 8', packages: 12043, lastIntrospection: '1 day ago', status: 'Valid', source: 'partner', lastSnapshot: 'a day ago', changesAdded: 17, changesRemoved: 17 },
        { name: 'EPEL 9 Everything x86_64', url: 'https://dl.fedoraproject.org/pub/epel/9/Everything/x86_64/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 9821, lastIntrospection: '1 day ago', status: 'Valid', source: 'partner', lastSnapshot: 'a day ago', changesAdded: 8, changesRemoved: 4 },
        { name: 'custom-epel-repository', url: 'https://download.fedoraproject.org/pub/epel/9/Everything/x86_64/', architecture: 'Any', osVersion: 'Any', packages: 14203, lastIntrospection: '1 day ago', status: 'Invalid', source: 'custom' },
        { name: 'development-tools-repo', url: 'https://internal.company.com/repos/dev-tools/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 567, lastIntrospection: '3 days ago', status: 'Valid', source: 'custom', lastSnapshot: '3 days ago' },
    ];

    return repositories.map((repo, index) => ({
        id: `repo-${index + 1}`,
        ...repo
    }));
};

const Repositories: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const [repositories] = useState<Repository[]>(generateRepositoryData());
    const [searchValue, setSearchValue] = useState('');
    const [sortBy, setSortBy] = useState<ISortBy>({});
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterBy, setFilterBy] = useState('Name/URL');
    const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
    const [repoToggles, setRepoToggles] = useState<Set<string>>(new Set(['redhat']));
    const [isBulkSelectOpen, setIsBulkSelectOpen] = useState(false);
    const [isToolbarKebabOpen, setIsToolbarKebabOpen] = useState(false);
    const [openRowKebab, setOpenRowKebab] = useState<string | null>(null);

    const filteredAndSortedRepositories = useMemo(() => {
        let filtered = repositories;

        if (repoToggles.size > 0) {
            filtered = filtered.filter(repo => repoToggles.has(repo.source));
        }

        if (searchValue) {
            filtered = filtered.filter(repo =>
                repo.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                repo.url.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        if (sortBy.index !== undefined) {
            const { index, direction } = sortBy;
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
    }, [repositories, searchValue, sortBy, repoToggles]);

    const paginatedRepositories = useMemo(() => {
        const startIdx = (page - 1) * perPage;
        return filteredAndSortedRepositories.slice(startIdx, startIdx + perPage);
    }, [filteredAndSortedRepositories, page, perPage]);

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

    return (
        <>
            <PageBreadcrumb>
                <Breadcrumb>
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
                    <BreadcrumbItem isActive>Repositories</BreadcrumbItem>
                </Breadcrumb>
            </PageBreadcrumb>

            <PageSection aria-label="Repositories title">
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsNone' }}>
                    <FlexItem>
                        <Title headingLevel="h1" size="2xl">Repositories</Title>
                    </FlexItem>
                    <FlexItem>
                        <Popover
                            headerContent="About repositories"
                            bodyContent={
                                <div>
                                    <p>Manage content repositories for manual snapshots and custom repository sources.</p>
                                    <p>To manage templates and set up content patching workflows, go to the Content Management page.</p>
                                </div>
                            }
                            position="right"
                        >
                            <Button variant="plain" aria-label="Help for Repositories">
                                <OutlinedQuestionCircleIcon />
                            </Button>
                        </Popover>
                    </FlexItem>
                </Flex>
                <p style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px' }}>
                    Manage custom repositories for use within templates and content management workflows.
                    <br />
                    To manage templates and set up content patching workflows, go to the{' '}
                    <Button variant="link" isInline onClick={() => navigate('/content-management')}>
                        Templates
                    </Button>{' '}
                    page.
                </p>
            </PageSection>

            <PageSection aria-label="Repositories" isFilled>
                <Toolbar id="repositories-toolbar" inset={{ default: 'insetNone' }} className="app-repositories-toolbar">
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
                                    <DropdownItem onClick={() => setSelectedRepositories(paginatedRepositories.map(r => r.id))}>
                                        Select page ({paginatedRepositories.length} items)
                                    </DropdownItem>
                                    <DropdownItem onClick={() => setSelectedRepositories(filteredAndSortedRepositories.map(r => r.id))}>
                                        Select all ({filteredAndSortedRepositories.length} items)
                                    </DropdownItem>
                                </DropdownList>
                            </Dropdown>
                        </ToolbarItem>
                        <ToolbarGroup className="app-toolbar-filter-group">
                            <ToolbarItem>
                                <Select
                                    id="repository-filter-select"
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
                                        <SelectOption value="Name/URL">Name/URL</SelectOption>
                                    </SelectList>
                                </Select>
                            </ToolbarItem>
                            <ToolbarItem>
                                <SearchInput
                                    placeholder="Search repositories"
                                    value={searchValue}
                                    onChange={(_event, value) => setSearchValue(value)}
                                    onClear={() => setSearchValue('')}
                                />
                            </ToolbarItem>
                        </ToolbarGroup>
                        <ToolbarItem>
                            <ToggleGroup aria-label="Repository type">
                                <ToggleGroupItem
                                    text="Custom"
                                    buttonId="toggle-custom"
                                    isSelected={repoToggles.has('custom')}
                                    onChange={() => {
                                        setRepoToggles(prev => {
                                            const next = new Set(prev);
                                            next.has('custom') ? next.delete('custom') : next.add('custom');
                                            return next;
                                        });
                                        setSelectedRepositories([]); setPage(1);
                                    }}
                                />
                                <ToggleGroupItem
                                    text="Red Hat"
                                    buttonId="toggle-redhat"
                                    isSelected={repoToggles.has('redhat')}
                                    onChange={() => {
                                        setRepoToggles(prev => {
                                            const next = new Set(prev);
                                            next.has('redhat') ? next.delete('redhat') : next.add('redhat');
                                            return next;
                                        });
                                        setSelectedRepositories([]); setPage(1);
                                    }}
                                />
                                <ToggleGroupItem
                                    text="Partner"
                                    buttonId="toggle-partner"
                                    isSelected={repoToggles.has('partner')}
                                    onChange={() => {
                                        setRepoToggles(prev => {
                                            const next = new Set(prev);
                                            next.has('partner') ? next.delete('partner') : next.add('partner');
                                            return next;
                                        });
                                        setSelectedRepositories([]); setPage(1);
                                    }}
                                />
                            </ToggleGroup>
                        </ToolbarItem>
                        <ToolbarItem>
                            <Button variant="primary">Add repositories</Button>
                        </ToolbarItem>
                        <ToolbarItem>
                            <Dropdown
                                isOpen={isToolbarKebabOpen}
                                onOpenChange={setIsToolbarKebabOpen}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                    <MenuToggle
                                        ref={toggleRef}
                                        variant="plain"
                                        onClick={() => setIsToolbarKebabOpen(!isToolbarKebabOpen)}
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

                <Table aria-label="Repositories table" variant="compact" className="app-repositories-table">
                    <Thead>
                        <Tr>
                            <Th />
                            <Th {...getSortParams(0)}>Name</Th>
                            <Th {...getSortParams(1)} width={10}>Architecture</Th>
                            <Th {...getSortParams(2)} width={10}>OS version</Th>
                            <Th {...getSortParams(3)} width={10}>Packages</Th>
                            <Th {...getSortParams(4)} width={15}>Last introspection</Th>
                            <Th {...getSortParams(5)} width={10}>Status</Th>
                            <Th aria-label="Row actions" />
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
                                        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                            <FlexItem>{repository.name}</FlexItem>
                                            {repository.source === 'partner' && (
                                                <FlexItem>
                                                    <Label color="grey" isCompact icon={<FolderOpenIcon />}>Partner</Label>
                                                </FlexItem>
                                            )}
                                        </Flex>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            <a href={repository.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                                {repository.url}{' '}
                                                <ExternalLinkAltIcon style={{ fontSize: '0.75em' }} />
                                            </a>
                                        </div>
                                        {repository.lastSnapshot && (
                                            <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                                Last snapshot {repository.lastSnapshot}
                                                {repository.changesAdded !== undefined && (
                                                    <span style={{ marginLeft: '16px' }}>
                                                        Changes:{' '}
                                                        <ArrowUpIcon style={{ color: 'var(--pf-t--global--color--status--success--default)', fontSize: '0.85em' }} />{' '}
                                                        <span style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>{repository.changesAdded}</span>
                                                        {'  '}
                                                        <ArrowDownIcon style={{ color: 'var(--pf-t--global--color--status--danger--default)', fontSize: '0.85em' }} />{' '}
                                                        <span style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>{repository.changesRemoved}</span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
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
                                    <StatusDisplay status={repository.status} />
                                </Td>
                                <Td isActionCell>
                                    <Dropdown
                                        isOpen={openRowKebab === repository.id}
                                        onOpenChange={(isOpen) => setOpenRowKebab(isOpen ? repository.id : null)}
                                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                            <MenuToggle
                                                ref={toggleRef}
                                                variant="plain"
                                                onClick={() => setOpenRowKebab(openRowKebab === repository.id ? null : repository.id)}
                                                aria-label={`Actions for ${repository.name}`}
                                            >
                                                <EllipsisVIcon />
                                            </MenuToggle>
                                        )}
                                        popperProps={{ position: 'right' }}
                                    >
                                        <DropdownList>
                                            <DropdownItem onClick={() => setOpenRowKebab(null)}>Edit</DropdownItem>
                                            <DropdownItem onClick={() => setOpenRowKebab(null)}>Introspect now</DropdownItem>
                                            <DropdownItem onClick={() => setOpenRowKebab(null)}>View all snapshots</DropdownItem>
                                            <DropdownItem onClick={() => setOpenRowKebab(null)}>Trigger snapshot</DropdownItem>
                                        </DropdownList>
                                        <Divider />
                                        <DropdownList>
                                            <DropdownItem onClick={() => setOpenRowKebab(null)} isDanger>Delete</DropdownItem>
                                        </DropdownList>
                                    </Dropdown>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                <Pagination
                    itemCount={filteredAndSortedRepositories.length}
                    widgetId="repositories-pagination-bottom"
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

export { Repositories };
