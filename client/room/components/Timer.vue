<template>
  <div>{{ timeString }}</div>
</template>

<script>
import { duration } from 'moment';
import { interval } from 'rxjs/observable/interval';
import { merge } from 'rxjs/observable/merge';
import { takeWhile } from 'rxjs/operators/takeWhile';
import { mapTo } from 'rxjs/operators/mapTo';
import { scan } from 'rxjs/operators/scan';

export default {
  name: 'timer',
  observableMethods: {
    reset: 'reset$'
  },
  subscriptions() {
    const timer$ = interval(1000).pipe(
      takeWhile(() => !this.pause),
      mapTo(1)
    );

    const time$ = merge(
      timer$,
      this.reset$
    ).pipe(
      scan((acc, value) => value ? acc + 1 : 0, 0)
    );

    return {
      time: time$
    };
  },
  data: () => ({
    pause: false
  }),
  methods: {
    pause() {
      this.pause = true;
    },
    continue() {
      this.pause = false;
    }
  },
  computed: {
    timeString() {
      return duration(this.time * 1000, 'hh:mm:ss');
    }
  }
}
</script>

