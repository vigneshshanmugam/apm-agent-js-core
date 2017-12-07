module.exports = {
  opbeatSymbol: opbeatSymbol,
  apmSymbol: apmSymbol,
  patchMethod: patchMethod
}

function apmSymbol (name) {
  return '__apm_symbol__' + name
}

function opbeatSymbol (name) {
  return '__opbeat_symbol__' + name
}

function patchMethod (target, name, patchFn) {
  var proto = target
  while (proto && !proto.hasOwnProperty(name)) {
    proto = Object.getPrototypeOf(proto)
  }
  if (!proto && target[name]) {
    // somehow we did not find it, but we can see it. This happens on IE for Window properties.
    proto = target
  }
  var delegateName = opbeatSymbol(name)
  var delegate
  if (proto && !(delegate = proto[delegateName])) {
    delegate = proto[delegateName] = proto[name]
    proto[name] = createNamedFn(name, patchFn(delegate, delegateName, name))
  }
  return delegate
}

function createNamedFn (name, delegate) {
  try {
    return (Function('f', 'return function ' + name + '(){return f(this, arguments)}'))(delegate) // eslint-disable-line
  } catch (e) {
    // if we fail, we must be CSP, just return delegate.
    return function () {
      return delegate(this, arguments)
    }
  }
}
