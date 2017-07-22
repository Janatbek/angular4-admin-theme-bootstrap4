use strict;
use Data::Dumper;
my %widgetMap = (
        'GenericWidgetTable' =>'app-generic-table',
        'GenericWidgetChart' =>'app-generic-chart',
        'LotForecaster' =>'app-lot-forecaster',
        'UserAdministration' =>'app-user-administration',
        'CacheDataAdmin' =>'app-cache-data-admin',
        'DataPolicyAdmin' =>'app-data-policy-admin',
        'SideNavAdmin' =>'app-side-nav-admin',
        'WidgetAdmin' =>'app-widget-admin',
        'Diagnostics' =>'app-diagnostics',
        'RandomChartWidget' =>'app-random-chart',
		'WidgetHelp' => 'app-widget-help'
);

my @libraryDecisionHtml;

foreach my $key (keys %widgetMap)
{
	print "  <div *ngIf=\"Config.componentType == '$key'\">
    <$widgetMap{$key} [Config]=\"Config\"></$widgetMap{$key}>
  </div>
"
}
