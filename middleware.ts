import {
    clerkMiddleware,
    createRouteMatcher
} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/site', '/api/uploadthing']);


// {
//     href: 'http://localhost:3000/agency/saasd?q=123&topic=api',
//     origin: 'http://localhost:3000',
//     protocol: 'http:',
//     username: '',
//     password: '',
//     host: 'localhost:3000',
//     hostname: 'localhost',
//     port: '3000',
//     pathname: '/agency/saasd',
//     search: '?q=123&topic=api',
//     searchParams: URLSearchParams {  },
//     hash: ''
// }


export default clerkMiddleware((auth, req) => {
    if (!isPublicRoute(req)) {
        // 不是公共路由，需要认证
        const url = req.nextUrl; // 当前url地址
        let hostname = req.headers
        const searchParams = url.searchParams.toString();

        const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''
            }`;

        // 从请求头中提取自定义子域名（如果存在）。例如，如果你的域名是 example.com，而请求来自 subdomain.example.com，则 customSubDomain 将是 subdomain。
        const customSubDomain = hostname.get('host')?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`).filter(Boolean)[0];

        // 如果存在 customSubDomain，则使用该子域名重写 URL。
        if (customSubDomain) {
            return NextResponse.rewrite(
                new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
            )
        }

        // 如果路径是 /sign-in 或 /sign-up，则重定向到 /agency/sign-in
        if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
            return NextResponse.redirect(new URL(`/agency/sign-in`, req.url))
        }
        if (
            url.pathname === '/' ||
            (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
        ) {
            return NextResponse.rewrite(new URL('/site', req.url))
        }

        if (
            url.pathname.startsWith('/agency') ||
            url.pathname.startsWith('/subaccount')
        ) {
            return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url))
        }

        auth().protect();
    }

});
// 配置匹配的路由，符合才走中间件
export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
