import { NameValue, NameIndex } from 'app/common/interfaces/WidgetInterfaces';

export interface UserStatistics {
    _id: string;
    userName: string;
    widgetRegistration?: WidgetRegistration;
    widgetUsageStatistics: UsageCounter[];
    dataPolicyUsageStatistics: UsageCounter[];
    applicationUsageStatistics: UsageCounter[];

    sideNavUsageStatistics: UsageCounter[];
}

export interface WidgetRegistration {
    excludedWidgets?: string[];
    groupedWidgets: WidgetGroup[];
}

export interface WidgetGroup {
    contextKey: string;
    heightSpec: string;
    widthSpec: string;
    index: number;
    widgets: NameIndex[];
}

export interface UsageCounter {
    key: string;
    count: number;
    lastUsage: string;

}
