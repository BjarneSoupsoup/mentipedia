//go:build !dev

package baovault

// The production use case is simply a no-op, as the secrets will have to be manually populated by a human
func (vault BaoVault) Seed() { return }
