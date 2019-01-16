/**
 *
 */
package ai.bell.shop.web.shiro;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.filter.authc.FormAuthenticationFilter;

import com.google.gson.Gson;
import com.smthit.lang.data.ResponseBean;

import lombok.extern.slf4j.Slf4j;

/**
 * @author Bean
 *
 */
@Slf4j
public class ShiroFormAuthenticationFilter extends FormAuthenticationFilter {

	@Override
	protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception {
		boolean isAjaxRequest = isAjaxRequest(request);
		HttpServletRequest httpServletRequest = (HttpServletRequest) request;
		log.debug("");

		//判断是否是登录请求
		if(isLoginRequest(request, response)) {
			if (isLoginSubmission(request, response)) {
				String vcode = request.getParameter("code");
				String vvcode = (String) httpServletRequest.getSession().getAttribute("code");
				boolean codeValid = vcode != null && vcode.equalsIgnoreCase(vvcode);
				// 是ajax登录请求
				if (isAjaxRequest) {
					// 先判断验证码
					if (codeValid) {
						return executeLogin(request, response);
					} else {
						request.setAttribute("success", false);
						request.setAttribute("invalidCode", true);

						return true;
					}
				} else {
					if (codeValid) {
						return executeLogin(request, response);
					} else {
						request.setAttribute("loginError", "验证码错误.");
						return true;
					}
				}
			} else {
				return true;
			}
		} else {
			if (isAjaxRequest) {
				//没有登录
				ResponseBean data = new ResponseBean(HttpServletResponse.SC_FORBIDDEN, "没有登录", null);
				responseJson(response, data);
			} else {
				saveRequestAndRedirectToLogin(request, response);
			}

			return false;
		}

	}

	@Override
	protected boolean onLoginFailure(AuthenticationToken token, AuthenticationException e, ServletRequest request,
			ServletResponse response) {
		request.setAttribute("success", false);
		request.setAttribute("exception", e);

		return true;
	}

	@Override
	protected boolean onLoginSuccess(AuthenticationToken token, Subject subject, ServletRequest request,
			ServletResponse response) throws Exception {
		request.setAttribute("success", true);
		return true;
	}

	@Override
	public void afterCompletion(ServletRequest request, ServletResponse response, Exception exception)
			throws Exception {
		if (isLoginRequest(request, response)) {

		}
		// TODO Auto-generated method stub
		super.afterCompletion(request, response, exception);
	}

	private boolean isAjaxRequest(ServletRequest request) {
		HttpServletRequest httpServletRequest = (HttpServletRequest) request;
		String requestedWith = httpServletRequest.getHeader("X-Requested-With");

		return "XMLHttpRequest".equalsIgnoreCase(requestedWith);
	}

	private void responseJson(ServletResponse response, Object data) throws IOException {
		response.setContentType("text/plain;charset=UTF-8");
		response.setCharacterEncoding("UTF-8");
		PrintWriter out = response.getWriter();

		out.print(new Gson().toJson(data));
		out.flush();
		out.close();
	}

}
