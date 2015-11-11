// import { WebDevTecService, ITecThing } from '../components/webDevTec/webDevTec.service';
import { ShimmerService } from '../components/shimmer/shimmer.service';
import { UserSearchBarService } from '../components/userSearchBar/userSearchBar.service';


export class RequestsController {

  private chart;
  public shims: ShimMap;
  public parameters: RequestParameters;

  public dateTypes = [
    'effective_timeframe',
    'creation_date'
  ];


  /* @ngInject */
  constructor(private $scope:angular.IScope, private shimmer: ShimmerService, private userSearchBar: UserSearchBarService) {
    this.shims = shimmer.shims;

    // if the list of shims changes, update the panel states
    // to include any new shims
    var defaultShim = userSearchBar.selectedUser && userSearchBar.selectedUser.authorizations[0] ? this.shims[userSearchBar.selectedUser.authorizations[0]] : undefined;
    $scope.$watchCollection('requests.shims', ((shims: ShimMap) => {
        if( shims ){
          this.parameters = {
            shim: defaultShim,
            schema: undefined,
            dateType: undefined,
            startDate: undefined,
            endDate: undefined,
            url: ''
          };
          console.log(shims)
        }
    }).bind(this));

    $scope.$watchCollection('requests.userSearchBar.selectedUser', ((user: User) => {
      if (user) {
        this.updateUrl();
      }
    }).bind(this));

    $scope.$watch('requests.parameters.startDate', ((date: Date) => {
      if (date) {
        this.updateUrl();
      }
    }).bind(this));

    $scope.$watch('requests.parameters.endDate', ((date: Date) => {
      if (date) {
        this.updateUrl();
      }
    }).bind(this));

  }

  public getData(){
    var self = this;
    this.shimmer.getData( this.parameters ).then( function(response){
      if (this.chart) {
          console.info('chart', this.chart);
          this.chart.destroy();
      }
      var options = {
        measures: {
          heart_rate: {
            chart: {
              thresholds: {}
            }
          },
          body_weight: {
            chart: {
              thresholds: {}
            }
          }
        }
      };
      this.chart = new OMHWebVisualizations.Chart(response.data.body, $('.chart-container'), self.parameters.schema.name.replace('-','_'), options);
      this.chart.renderTo($('svg.response-chart')[0]);
    });
  }

  public updateUrl(){
    var parametersReady = true;
    for (var parameterName in this.parameters) {
      parametersReady = parametersReady && (this.parameters[parameterName] != undefined);
    }
    if (parametersReady){
      this.parameters.url = this.shimmer.getRequestUrl(this.userSearchBar.selectedUser, this.parameters);
    }
  }

  public schemaAvailable( shimName: string ){
    var schemaAvailable = this.userSearchBar.selectedUser ? this.userSearchBar.selectedUser.authorizations.indexOf(shimName) >= 0 : false;
    return schemaAvailable;
  }

}