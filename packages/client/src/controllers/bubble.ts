import $ from 'jquery';
import _ from 'lodash';

import Blob from '../renderer/bubbles/blob';

import type Entity from '../entity/entity';
import type Game from '../game';

export default class BubbleController {
    private bubbles: { [id: string]: Blob } = {};
    private container = $('#bubbles');

    public constructor(private game: Game) {}

    /**
     * This creates the blob that will be used to display text.
     *
     * @param id - An identifier for the bubble we are creating.
     * @param message - A string of the text we are displaying.
     * @param duration - How long the bubble will display for.
     * @param isObject - Value used to determine object.
     * @param info - Used in conjunction with `isObject` to specify object data.
     */
    public create(
        id: string,
        message: string,
        duration = 5000,
        isObject?: boolean,
        info?: Entity
    ): void {
        const { bubbles, game, container } = this;

        const bubble = bubbles[id];

        if (bubble) {
            bubble.reset(game.time);

            $(`#${id} p`).html(message);
        } else {
            const element = $(
                `<div id="${id}" class="bubble"><p>${message}</p><div class="bubbleTip"></div></div>`
            );

            $(element).appendTo(container);

            bubbles[id] = new Blob(id, element, duration, isObject, info);

            // return bubbles[id];
        }
    }

    public setTo(info: Entity | undefined): void {
        if (!info) return;

        const bubble = this.get(info.id);

        const camera = this.game.getCamera();

        const scale = this.game.renderer.getScale();
        const tileSize = 48; // 16 * scale

        const x = (info.x - camera.x) * scale;
        const width = parseInt(bubble.element.css('width')) + 24;
        const offset = width / 2 - tileSize / 2;
        const offsetY = -20;
        const y = (info.y - camera.y) * scale - tileSize * 2 - offsetY;

        bubble.element.css({ left: `${x - offset + 3}px`, top: `${y}px` });
    }

    public update(time: number): void {
        const { bubbles, game } = this;

        _.each(bubbles, (bubble) => {
            if (!bubble) return;

            const entity = game.entities.get(bubble.id);

            if (entity) this.setTo(entity);

            if (bubble.type === 'object') this.setTo(bubble.info);

            if (bubble.isOver(time)) {
                bubble.destroy();
                delete bubbles[bubble.id];
            }
        });
    }

    private get(id: string): Blob {
        return this.bubbles[id];
    }

    public clean(): void {
        _.each(this.bubbles, (bubble) => bubble.destroy());

        this.bubbles = {};
    }

    public destroy(id: string): void {
        const bubble = this.get(id);

        if (!bubble) return;

        bubble.destroy();
        delete this.bubbles[id];
    }
}
