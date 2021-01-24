import {AfterViewInit, Component, ElementRef} from '@angular/core';
declare var hljs: any;

@Component({
    selector: 'faq',
    templateUrl: './faq.component.html'
})
export class Faq implements AfterViewInit {

    question1 = 'I pushed new options to my options array, why do they not appear in the drop down list?';

    question1html = `
<pre><code class="html">&lt;ng-select
    [options]="myOptions"
&lt;/ng-select&gt;
</code></pre>`;

    question1tsNotWorking = `<pre><code class="typescript">
this.myOptions = [];

ngOnInit() {
    this.optionsService.loadOptions().subscribe((options) => {
        options.forEach((option) => {
            this.myOptions.push(option);
        });
    });
}
</code></pre>`;

    question1tsWorking = `<pre><code class="typescript">
this.myOptions = [];

ngOnInit() {
    this.optionsService.loadOptions().subscribe((options) => {
        this.myOptions = options;
    });
}
</code></pre>`;

    constructor(
        private elementRef: ElementRef,
    ) {}

    ngAfterViewInit() {
        hljs.initHighlighting();
        const nodes: NodeList = this.elementRef
            .nativeElement
            .querySelectorAll('.typescript, .html, .css, .shell-session');

        for (let i = 0; i < nodes.length; i++) {
            hljs.highlightBlock(nodes[i]);
        }
    }

    goTo(location: string): void {
        window.location.hash = '';
        window.location.hash = location;
    }
}
