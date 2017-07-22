import { ChartConfiguration, ChartType } from 'app/common/interfaces/chartJs.d';

// Shared widget configuration definition for ALL widgets
export interface WidgetConfiguration {

    // Unique name
    name: string;
    adminRequired?: boolean;
    description: string;

    // Information about who to contact for support if there are issues with the widget in the app
    supportMessage: string;

    // Used at runtime to determine which widget to load up.
    componentType: string;

    // Free section for adding whatever configuration the widget needs. When it is created in the group
    // display component, this section will be made available to it.
    config?: any;

    dataConsumerConfiguration: DataConsumerConfiguration;

    // See interface definition
    contextMatchingRules: ContextMatchingRule[];

}

// At any time the application can have a combination of context name/value pairs.  A list of these rules
//  is used to determine if the widget should be shown given the state of th context data
// For a widget to be displayed, the rule is as follows:
// 1. Context has ALL non-optional names
// 2. Context names have same value for all rules that specify a valueMatch
// 3. Context can have optional names
// 4. If context has names that aren't specified in the rule, the widget won't be displayed.
export interface ContextMatchingRule {
    contextName: string;
    valueMatch?: string;
    optional: boolean;
}

export interface DataConsumerConfiguration {
    dataPolicy: string;

    // These parameter name/values are ALWAYS sent with the data request
    fixedParameters?: NameValue[];

    // Name is column name to sort, value can be '' or 'asc' to sort ascending or 'desc' to sort descending
    sortColumns?: NameValue[];

    // Mapping context name in app to query params in data source. Example:
    //  context is currently [{Source: Probe}, {Step: FPP.00}, {Design: L06A}]
    //  contextMapping is [{name: Step, value: ''}, {name: Design, value: 'DesignId'}]
    //  -> query params would be "?Step=FPP.00&DesignId=L06A"
    contextParameters?:  NameValue[];
    // Optional rules for filtering the data that comes back
    filterConfiguration?:   FilterRule[];
    overrideCacheRules?: CacheRules;
    dataGrouping?: DataGrouping;
    pivot?: Pivot;
    columns?: string[]; // Will be populated when data is returned at runtime
}

export interface DataPolicy {
    name: string;
    supportMessage: string;
    supportGroup: string;
    supportNameList: string;
    sourceURL: string;
    CacheRules: CacheRules;
    DesignIdColumn?: string;
    fixedParameters?: NameValue[];
    columnRenameMap?: NameValue[];
}

export interface FilterRule {
    column: string;
    value?: string;
    contextValueName?: string;
    serverSide: boolean;
    // string operators: eq (default), startsWith, endsWith, contains,
    // case insensitive string operators ncEq, ncStartsWith, ncEndsWith, ncContains
    // number operators: ==, gt, lt, ge, le, ne
    operator?: string;
}

export interface CacheRules {
    period:  string;    // 'hour|minute|day|workWeek|month|permanent|never'
    frequency?: number;
    targetMinute?: number;
    targetHour?: number;
    targetDay?: number;
    targetWorkWeekDay?: number;
}
export interface GenericTableConfiguration {
    tableColumnRules: TableColumnRules[];
}

export interface TableColumnRules {
    columnName: string; // Can be name or * for all columns
    alternateColorOnValueChange: boolean; // if true, as value changes going down column, bg color changes
    heatmapRules?: HeatmapRules;
}

export interface HeatmapRules {
    low: string; // Can be 'min' or a number value as string. if min, uses min value of column
    high: string; // Can be 'max' or a number value as string. if max, uses max value of column
}

export interface GenericFullChartConfiguration {

    // Specific labels on the x axis.  If these exist for the data, they will be the only labels displayed in the x axis
    xTickLabels?: string[];

    // Specific labels on the y axis.  If these exist for the data, they will be the only labels displayed in the y axis
    yTickLabels?: string[];

    // Columns to use for the X axis label - this will be the label across multiple series
    xAxisLabelColumns: string[];

    // Columns and their values used for the popopver tooltip when a user hovers over a chart point
    pointLabelColumns: string[];

    // Columns/values published as a filter parameter to the platform when the user clicks on a point
    filterColumns: string[];

    // This is the main means of defining the series that will be displayed.  A series has a one to one correlation to
    // a data set column.  Series can be grouped so that they can have different left/right axes labels
    seriesGroups: SeriesGroupConfig[];

    // Full Chart.js configuration set.  This allows you to set colors, data series types (bar, line, etc), scale options,
    // and anything else that can be configured. See the ChartConfiguration interface definition for a dive down into the
    // specifics
    chartConfig: ChartConfiguration;
}

// This is an older and much simpler configuration interface for the generic chart component.  It doesn't allow for the flexibility
// of the GenericFullChartConfiguration interface but is less complicated.
export interface GenericChartConfiguration {

    labelSources?: NameValue[];
    seriesGroups: SeriesGroupConfig[];

    // For tables or charts.  Name = series or column name.  Value = Context name
    // If this exists and user clicks on a point in the graph or a cell on a table, the
    // generic widget will notify the app of an addinal context where the name = context name and value =
    // value of point or cell clicked.
    clickMap?: NameValue[];

}

export interface SeriesGroupConfig {
    scalePosition: string;
    id: string;
    series: SeriesConfig[]
}

export interface SeriesConfig {
    // Series name displayed
    name: string;
    // Column that is source of data
    sourceColumn: string;

    // For scatter charts, sourceColumn is X and this is Y
    sourceColumnY?: string;
    // Type of chart (line, bar)
    type: ChartType;
    // type: ChartType | string;
}

export interface NameValue {
    name: string;
    value: string;
}

export interface NameIndex {
    name: string;
    index: number;
}

export interface DataGrouping {
    serverSide?: boolean;
    // Group data by these column
    groupBy: string[];
    // Aggregate by these columns.  Name = column name, Value = aggregate operator (sum, avg, count, min, max, others?)
    aggregations: Aggregation[];
}

export interface Aggregation {
    name: string;
    operation: string;
    rename: string;
}

export interface Pivot {
    name: string;
    operation: string;
    rename: string;
}

export interface ManagedDataReply {
    CacheData: CacheDataInfo;
    AppliedDataPolicy: DataPolicy;
}

export interface CacheDataInfo {
    MinutesRemaining: number;
    RetrievedFromCache: boolean;
    key: string;
    Payload: any;
    CacheDate: string;
}