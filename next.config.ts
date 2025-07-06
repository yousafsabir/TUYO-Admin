import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
	images: {
		unoptimized: true,
	},
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
