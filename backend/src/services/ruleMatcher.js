function matchRule(text, rules = []) {
    const lower = text.toLowerCase();
    return rules.find(
      r => r.enabled && lower.includes(r.keyword.toLowerCase())
    );
  }

  module.exports = { matchRule };
