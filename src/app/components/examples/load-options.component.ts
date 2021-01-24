import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
declare var hljs: any;

import { OptionService } from '../../services/option.service';
import {IOption} from '../../../../projects/ng-select/src/lib/option.interface';

@Component({
    selector: 'load-options',
    templateUrl: 'load-options.component.html'
})
export class LoadOptions implements AfterViewInit, OnInit, OnDestroy {

    characters: Array<IOption>;
    selectedCharacter = '3';
    timeLeft = 5;

    private dataSub: Subscription = null;

    constructor(
        private elementRef: ElementRef,
        private optionService: OptionService
    ) {}

    ngOnInit() {
        this.runTimer();
        this.dataSub = this.optionService.loadCharacters().subscribe((options) => {
            this.characters = options;
        });
    }

    ngOnDestroy() {
        if (this.dataSub !== null) { this.dataSub.unsubscribe(); }
    }

    onClean() {
        console.log('Cleaned');
    }

    ngAfterViewInit() {
        hljs.initHighlighting();
        const nodes: NodeList = this.elementRef
            .nativeElement
            .querySelectorAll('.typescript, .html, .css');

        for (let i = 0; i < nodes.length; i++) {
            hljs.highlightBlock(nodes[i]);
        }
    }

    runTimer() {
        const timer = setInterval(() => {
            this.timeLeft -= 1;
            if (this.timeLeft === 0) {
                clearInterval(timer);
            }
        }, 1000);
    }

    html: string = `
<pre><code class="html">&lt;ng-select
    [options]="characters"
    [(ngModel)]="selectedCharacter"&gt;
&lt;/ng-select&gt;
</code></pre>`;

    ts: string = `
<pre><code class="typescript">export class LoadOptionsExample implements OnInit {

    characters: Array&lt;IOption&gt;;
    selectedCharacter: string = '3';

    constructor(
        private optionService: OptionService
    ) {}

    ngOnInit() {
        this.optionService.loadOptions().subscribe((options) => {
            this.characters = options;
        });
    }
}
</pre></code>`;

}
