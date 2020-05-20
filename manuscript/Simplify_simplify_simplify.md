<!-- textlint-disable -->

## Simplify, simplify, simplify

<!-- textlint-enable -->

- Avoid verbose and unnecessary code

<!-- test-skip -->

```js
data.discontinued ? data.discontinued === 1 : false;
```

<!-- test-skip -->

```js
if (
  reasonType === REASON_TYPES.REPLACEMENT &&
  conditionCheck === REASON_TYPES.RETURN
) {
  return true;
} else {
  return false;
}
```

<!-- test-skip -->

```js
if (itemInfo && itemInfo.isAutoReplaceable === true) {
  return true;
}

return false;
```

<!-- test-skip -->

```js
const result = '...';
return result;
```

<!-- test-skip -->

```js
const result = handleUpdateResponse(response.status);
this.setState(result);
```

<!-- test-skip -->

```js
function render() {
  let p = this.props;
  return <BaseComponent {...p}></BaseComponent>;
}
```
