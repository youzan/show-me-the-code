<template>
  <div class="timer">
    <poptip trigger="hover" placement="bottom">
      <badge :count="record.length" dot>
        {{ formatTime(time) }}
      </badge>
      <ul slot="content" class="timer-record">
        <li v-for="(time, index) in record" :key="time">
          {{ formatTime(time) }}
          <span class="timer-record-plus" v-if="index !== 0">+ {{ formatTime(record[index] - record[index - 1]) }}</span>
        </li>
      </ul>
    </poptip>
    <span @click="play">
      <icon type="play" v-if="paused"  />
    </span>
    <span @click="pause">
      <icon type="pause" v-if="!paused" />
    </span>
    <span @click="reset">
      <icon type="android-refresh" />
    </span>
    <span @click="flag">
      <icon type="flag" />
    </span>
  </div>
</template>

<script>
import { duration } from 'moment';
import { empty } from 'rxjs/observable/empty';
import { interval } from 'rxjs/observable/interval';
import { of } from 'rxjs/observable/of';
import { merge } from 'rxjs/observable/merge';
import { takeWhile } from 'rxjs/operators/takeWhile';
import { mapTo } from 'rxjs/operators/mapTo';
import { map } from 'rxjs/operators/map';
import { scan } from 'rxjs/operators/scan';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';
import { delay } from 'rxjs/operators/delay';

export default {
  name: 'timer',
  observableMethods: {
    resetTimer: 'reset$'
  },
  subscriptions() {
    const paused$ = this.$watchAsObservable('paused');
    const timer$ = paused$.pipe(
      scan((acc, _) => !acc, true),
      startWith(true),
      switchMap(paused => (paused ? empty() : interval(1000))),
      mapTo(1)
    );

    const blink$ = this.$watchAsObservable('record').pipe(
      switchMap(() => of(false).pipe(delay(500), startWith(true)))
    );

    const time$ = merge(timer$, this.reset$.pipe(mapTo(0))).pipe(
      scan((acc, value) => (value ? acc + 1 : 0), 0),
      startWith(0)
    );

    return {
      time: time$,
      blink: blink$
    };
  },
  data: () => ({
    paused: true,
    record: []
  }),
  methods: {
    pause() {
      this.paused = true;
    },
    play() {
      this.paused = false;
    },
    flag() {
      this.record.push(this.time);
    },
    reset() {
      this.record = [];
      this.resetTimer();
    },
    formatSingle(time) {
      const str = `00${time}`;
      return str.substring(str.length - 2, str.length);
    },
    formatTime(time) {
      const h = this.formatSingle(Math.floor(time / 3600));
      const m = this.formatSingle(Math.floor((time % 3600) / 60));
      const s = this.formatSingle(time % 60);

      return `${h}:${m}:${s}`;
    }
  }
};
</script>

<style lang="scss">
.timer {
  font-size: 16px;
  user-select: none;

  .ivu-icon {
    display: inline-block;
    text-align: center;
    width: 25px;
    height: 25px;
    line-height: 25px;

    &:hover {
      background: white;
    }

    &.ivu-icon-play {
      color: green;
    }

    &.ivu-icon-pause {
      color: orange;
    }

    &.ivu-icon-android-refresh {
      &:hover {
        color: black;
      }
    }

    &.ivu-icon-flag {
      color: aqua;

      &:hover {
        color: deepskyblue;
      }
    }
  }

  .ivu-badge-dot {
    box-shadow: none;
  }

  .ivu-poptip-rel {
    display: flex;
  }
}

.timer-record {
  color: black;
  &-plus {
    padding-left: 10px;
    color: red;
  }
}
</style>
