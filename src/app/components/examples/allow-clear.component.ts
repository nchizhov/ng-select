import {AfterViewInit, Component, ElementRef} from '@angular/core';
declare var hljs: any;

import {OptionService} from '../../services/option.service';
import {IOption} from '../../../../projects/ng-select/src/lib/option.interface';

@Component({
    selector: 'allow-clear',
    templateUrl: './allow-clear.component.html'
})
export class AllowClear implements AfterViewInit {

    characters: Array<IOption> = this.optionService.getCharacters();
    selectedCharacter = '3';

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

    html: string = `
<pre><code class="html">&lt;ng-select
    [options]="characters"
    [allowClear]="true"
    [(ngModel)]="selectedCharacter"&gt;
&lt;/ng-select&gt;
</code></pre>`;

    ts: string = `
<pre><code class="typescript">export class AllowClearExample {

    characters: Array&lt;IOption&gt; = this.optionService.getCharacters();
    selectedCharacter: string = '3';

    constructor(
        private optionService: OptionService
    ) {}
}
</pre></code>`;
}
