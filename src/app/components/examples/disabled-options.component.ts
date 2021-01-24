import {AfterViewInit, Component, ElementRef} from '@angular/core';
declare var hljs: any;

import {OptionService} from '../../services/option.service';
import {IOption} from '../../../../projects/ng-select/src/lib/option.interface';

@Component({
    selector: 'disabled-options',
    templateUrl: 'disabled-options.component.html'
})
export class DisabledOptions implements AfterViewInit {
    charactersWithDisabled: Array<IOption> = this.optionService.getCharactersWithDisabled();

    constructor(
        private elementRef: ElementRef,
        private optionService: OptionService
    ) {}

    ngAfterViewInit() {
        hljs.initHighlighting();
        const nodes: NodeList = this.elementRef
            .nativeElement
            .querySelectorAll('.typescript, .html, .css');

        for (let i = 0; i < nodes.length; i++) {
            hljs.highlightBlock(nodes[i]);
        }
    }

    data: string = `<pre><code class="typescript">charactersWithDisabled: Array&lt;IOption&gt; = [
    {value: '0', label: 'Aech'},
    {value: '1', label: 'Art3mis', disabled: true},
    {value: '2', label: 'Daito'},
    {value: '3', label: 'Parzival'},
    {value: '4', label: 'Shoto', disabled: true}
];
</pre></code>
`;

    html: string = `
<pre><code class="html">&lt;ng-select
    [options]="charactersWithDisabled"&gt;
&lt;/ng-select&gt;
</code></pre>`;

}
