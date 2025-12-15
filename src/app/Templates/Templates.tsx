import React, { useCallback, useMemo, useState } from 'react';
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
    SortAmountUpIcon
} from '@patternfly/react-icons';

interface Template {
    id: string;
    name: string;
    description: string;
    architecture: 'x86_64' | 'aarch64';
    version: string;
    snapshotDate: string;
    status: 'Valid' | 'Invalid';
}

const generateTemplateData = (): Template[] => {
    const templates = [
        { name: 'fhgvijknm', description: '', architecture: 'x86_64' as const, version: 'el9', snapshotDate: 'Use latest', status: 'Valid' as const },
        { name: 'fgcvhbjknml', description: '', architecture: 'aarch64' as const, version: 'el9', snapshotDate: 'Use latest', status: 'Valid' as const },
        { name: 'fghvbjnm', description: '', architecture: 'x86_64' as const, version: 'el9', snapshotDate: 'Use latest', status: 'Valid' as const },
        { name: 'Test-template-fBrt', description: 'Test template', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '06 Mar 2025', status: 'Valid' as const },
        { name: 'test2', description: '', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '07 May 2025', status: 'Valid' as const },
        { name: 'dd', description: 'dd', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '09 Mar 2025', status: 'Valid' as const },
        { name: 'efjew', description: '', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '05 Mar 2025', status: 'Valid' as const },
        { name: 'n', description: '', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '02 Mar 2025', status: 'Invalid' as const },
        { name: 'Test-template-VJuj', description: 'Test template', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '06 Mar 2025', status: 'Valid' as const },
        { name: 'Test-template-wNoe', description: 'Test template', architecture: 'x86_64' as const, version: 'el8', snapshotDate: '06 Mar 2025', status: 'Valid' as const },
        { name: 'sdw', description: 'ds', architecture: 'aarch64' as const, version: 'el8', snapshotDate: '09 Dec 2024', status: 'Invalid' as const },
    ];

    return templates.map((template, index) => ({
        id: `template-${index + 1}`,
        ...template
    }));
};

interface ActionItem {
    title: string;
    onClick: () => void;
}

const Templates: React.FunctionComponent = () => {
    const [templates] = useState<Template[]>(generateTemplateData());
    const [searchValue, setSearchValue] = useState('');
    const [sortBy, setSortBy] = useState<ISortBy>({});
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterBy, setFilterBy] = useState('Name');
    const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

    // Sample actions for each row
    const rowActions = (template: Template): ActionItem[] => [
        {
            title: 'Edit',
            onClick: () => console.log(`Edit ${template.name}`)
        },
        {
            title: 'Delete',
            onClick: () => console.log(`Delete ${template.name}`)
        }
    ];


    const filteredAndSortedData = useMemo(() => {
        let filtered = templates;

        // Apply search filter
        if (searchValue) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                template.description.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        // Apply sorting
        if (sortBy.index !== undefined) {
            const { index, direction } = sortBy;
            filtered = [...filtered].sort((a, b) => {
                let aValue, bValue;
                switch (index) {
                    case 0: // Name
                        aValue = a.name;
                        bValue = b.name;
                        break;
                    case 1: // Description
                        aValue = a.description;
                        bValue = b.description;
                        break;
                    case 2: // Architecture
                        aValue = a.architecture;
                        bValue = b.architecture;
                        break;
                    case 3: // Version
                        aValue = a.version;
                        bValue = b.version;
                        break;
                    case 4: // Snapshot date
                        aValue = a.snapshotDate;
                        bValue = b.snapshotDate;
                        break;
                    case 5: // Status
                        aValue = a.status;
                        bValue = b.status;
                        break;
                    default:
                        return 0;
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

    const paginatedData = useMemo(() => {
        const startIdx = (page - 1) * perPage;
        return filteredAndSortedData.slice(startIdx, startIdx + perPage);
    }, [filteredAndSortedData, page, perPage]);

    const getSortParams = useCallback((columnIndex: number) => {
        return {
            sort: {
                sortBy,
                onSort: (_event: any, index: number, direction: 'asc' | 'desc') => {
                    setSortBy({ index, direction });
                },
                columnIndex
            }
        };
    }, [sortBy]);

    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedTemplates(paginatedData.map(template => template.id));
        } else {
            setSelectedTemplates([]);
        }
    };

    const handleSelectTemplate = (templateId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedTemplates(prev => [...prev, templateId]);
        } else {
            setSelectedTemplates(prev => prev.filter(id => id !== templateId));
        }
    };

    const isAllSelected = paginatedData.length > 0 && selectedTemplates.length === paginatedData.length;

    const StatusIcon = ({ status }: { status: 'Valid' | 'Invalid' }) => {
        if (status === 'Valid') {
            return <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success)' }} />;
        }
        return <ExclamationTriangleIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger)' }} />;
    };

    const StatusBadge = ({ status }: { status: 'Valid' | 'Invalid' }) => {
        return (
            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                    <StatusIcon status={status} />
                </FlexItem>
                <FlexItem>
                    <span style={{ color: status === 'Valid' ? 'var(--pf-t--global--text--color--status--success)' : 'var(--pf-t--global--text--color--status--danger)' }}>
                        {status}
                    </span>
                </FlexItem>
            </Flex>
        );
    };

    const toolbar = (
        <Toolbar id="templates-toolbar">
            <ToolbarContent>
                <ToolbarItem>
                    <Checkbox
                        id="select-all"
                        isChecked={isAllSelected}
                        onChange={(_event, checked) => handleSelectAll(checked)}
                        aria-label="Select all templates"
                    />
                </ToolbarItem>
                <ToolbarGroup>
                    <ToolbarItem style={{ marginRight: '0' }}>
                        <Select
                            id="filter-select"
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
                    <ToolbarItem style={{ marginLeft: '4px', marginRight: '0' }}>
                        <SearchInput
                            placeholder="Filter by name"
                            value={searchValue}
                            onChange={(_event, value) => setSearchValue(value)}
                            onClear={() => setSearchValue('')}
                        />
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarItem>
                    <Button variant="primary">Add content template</Button>
                </ToolbarItem>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                    <Pagination
                        itemCount={filteredAndSortedData.length}
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
    );

    return (
        <div style={{ padding: '24px', backgroundColor: 'var(--pf-t--global--background--color--primary)' }}>
            <Breadcrumb>
                <BreadcrumbItem to="#" component="button">RHEL</BreadcrumbItem>
                <BreadcrumbItem to="#" component="button">Content</BreadcrumbItem>
                <BreadcrumbItem isActive>Templates</BreadcrumbItem>
            </Breadcrumb>
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                        <Title headingLevel="h1" size="2xl">
                            Templates
                        </Title>
                    </FlexItem>
                    <FlexItem>
                        <SortAmountUpIcon style={{ marginLeft: '8px', fontSize: '16px' }} />
                    </FlexItem>
                </Flex>
                <p style={{ marginTop: '8px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    View all content templates within your organization.
                </p>
            </div>

            {toolbar}

            <Table aria-label="Templates table">
                <Thead>
                    <Tr>
                        <Th />
                        <Th {...getSortParams(0)}>Name</Th>
                        <Th {...getSortParams(1)}>Description</Th>
                        <Th {...getSortParams(2)}>Architecture</Th>
                        <Th {...getSortParams(3)}>Version</Th>
                        <Th {...getSortParams(4)}>Snapshot date</Th>
                        <Th {...getSortParams(5)}>Status</Th>
                        <Th />
                    </Tr>
                </Thead>
                <Tbody>
                    {paginatedData.map((template) => (
                        <Tr key={template.id}>
                            <Td
                                select={{
                                    rowIndex: parseInt(template.id.split('-')[1]) - 1,
                                    onSelect: (_event, isSelected) => handleSelectTemplate(template.id, isSelected),
                                    isSelected: selectedTemplates.includes(template.id)
                                }}
                            />
                            <Td dataLabel="Name">
                                <a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                    {template.name}
                                </a>
                            </Td>
                            <Td dataLabel="Description">{template.description}</Td>
                            <Td dataLabel="Architecture">{template.architecture}</Td>
                            <Td dataLabel="Version">{template.version}</Td>
                            <Td dataLabel="Snapshot date">{template.snapshotDate}</Td>
                            <Td dataLabel="Status">
                                <StatusBadge status={template.status} />
                            </Td>
                            <Td>
                                <Dropdown
                                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                        <MenuToggle
                                            ref={toggleRef}
                                            variant="plain"
                                            onClick={() => { }}
                                        >
                                            <EllipsisVIcon />
                                        </MenuToggle>
                                    )}
                                >
                                    <DropdownList>
                                        {rowActions(template).map((action, index) => (
                                            <DropdownItem key={index} onClick={() => action.onClick && action.onClick()}>
                                                {action.title}
                                            </DropdownItem>
                                        ))}
                                    </DropdownList>
                                </Dropdown>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <div style={{ marginTop: '16px' }}>
                <Pagination
                    itemCount={filteredAndSortedData.length}
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
            </div>
        </div>
    );
};

export { Templates }; 