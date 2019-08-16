const { textarea } = require('blessed');

exports.MessagesAreaComponent = class {

  component = textarea({
    top: 0,
    right: 0,
    height: '100%-3',
    width: '70%',
    border: { type: 'line' },
    focusable: true,
  });

  /** @type {Subscription[]} */
  subs = [];

  constructor(channel$) {
    channel$.subscribe(this.onChannelChanged.bind(this));
  }

  onChannelChanged(channel) {
    if (channel == null) return;
    if (this.subs) this.subs.filter(a => !!a).forEach(sub => sub.unsubscribe())
    this.subs = [];

    this.subs.push(
      channel.messages$.subscribe(this.onMessagesChanged.bind(this))
    );
  }

  onMessagesChanged(messages) {
    this.component.setValue(messages.join('\n'));
    this.component.scrollTo(messages.length);
  }

}
