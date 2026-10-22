export const FILTER_BAR_CLASS_SPECS = [
  {
    key: 'bar-horizontal',
    className: 'ui-filter-bar ui-filter-bar--horizontal',
    keyValues: 'wrap, 12px gap',
    useCase: 'Primary filter row',
  },
  {
    key: 'advanced-panel',
    className: 'ui-filter-advanced-panel ui-border--default',
    keyValues: 'muted surface',
    useCase: 'Advanced filters shell',
  },
  {
    key: 'catalog-filter-controls',
    className: 'ui-catalog-filter-controls',
    keyValues: '8px gap',
    useCase: 'Catalog filter chip row',
  },
  {
    key: 'combobox-filter-item',
    className: 'ui-combobox-filter-toolbar__item',
    keyValues: 'flex-1 equal columns',
    useCase: 'Combobox panel dimension select column',
  },
] as const
