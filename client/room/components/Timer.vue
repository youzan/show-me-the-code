<template>
  <div class="timer">
    {{ time }}
    <span @click="play">
      <icon type="play" v-if="paused"  />
    </span>
    <span @click="pause">
      <icon type="pause" v-if="!paused" />
    </span>
    <span @click="reset">
      <icon type="android-refresh" />
    </span>
  </div>
</template>

<script>
import { duration } from 'moment';
import { empty } from 'rxjs/observable/empty';
import { interval } from 'rxjs/observable/interval';
import { merge } from 'rxjs/observable/merge';
import { takeWhile } from 'rxjs/operators/takeWhile';
import { mapTo } from 'rxjs/operators/mapTo';
import { map } from 'rxjs/operators/map';
import { scan } from 'rxjs/operators/scan';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

export default {
  name: 'timer',
  observableMethods: {
    reset: 'reset$'
  },
  subscriptions() {
    const paused$ = this.$watchAsObservable('paused');
    const timer$ = paused$.pipe(
      scan((acc, _) => !acc, true),
      startWith(true),
      switchMap(
        paused => paused ? empty() : interval(1000)
      ),
      mapTo(1)
    );

    const time$ = merge(
      timer$,
      this.reset$.pipe(
        mapTo(0)
      )
    ).pipe(
      scan((acc, value) => (console.log(value), (value ? acc + 1 : 0)), 0),
      startWith(0),
      map(time => `${Math.floor(time / 3600)}:${Math.floor((time % 3600) / 60)}:${time % 60}`)
    );

    return {
      time: time$
    };
  },
  data: () => ({
    paused: true
  }),
  methods: {
    pause() {
      this.paused = true;
    },
    play() {
      this.paused = false;
    }
  }
}
</script>

<style lang="scss">
.timer {
  font-size: 16px;

  .ivu-icon {
    display: inline-block;
    margin-left: 10px;

    &.ivu-icon-play {
      color: green;
    }

    &.ivu-icon-pause {
      color: orange;
    }

    &.ivu-icon-refresh {
      color: aqua;
    }
  }
}
</style>

