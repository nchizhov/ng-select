import {Component} from '@angular/core';

import {OptionService} from '../services/option.service';
import {IOption} from '../../../projects/ng-select/src/lib/option.interface';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class Home {

    version = '1.0.1';

    countries: Array<IOption> = this.optionService.getCountries();
    singleSelectValue = 'NL';
    multiSelectValue: Array<string> = ['BE', 'LU', 'NL'];

    constructor(
        private optionService: OptionService
    ) {}
}
