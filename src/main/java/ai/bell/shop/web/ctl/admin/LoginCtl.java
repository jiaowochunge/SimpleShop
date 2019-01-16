/**
 *
 */
package ai.bell.shop.web.ctl.admin;

import java.awt.Color;
import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.SecurityUtils;
import org.patchca.background.SingleColorBackgroundFactory;
import org.patchca.color.SingleColorFactory;
import org.patchca.filter.predefined.CurvesRippleFilterFactory;
import org.patchca.service.ConfigurableCaptchaService;
import org.patchca.utils.encoder.EncoderHelper;
import org.patchca.word.AdaptiveRandomWordFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.smthit.lang.data.ResponseBean;

import lombok.extern.slf4j.Slf4j;


/**
 * @author Bean
 *
 */
@Slf4j
@Controller
public class LoginCtl {

	@RequestMapping(value = "/login", method = RequestMethod.POST)
	@ResponseBody
	public ResponseBean login(HttpServletRequest request, Map<String, Object> map) {
		Boolean success = (Boolean)request.getAttribute("success");
		if(!success) {
			if (request.getAttribute("invalidCode") != null) {

				return new ResponseBean(301, "验证码错误", null);
			} else {
				String errMsg = "用户名/密码错误";
				if (request.getAttribute("exception") != null) {
					Exception e = (Exception) request.getAttribute("exception");
					errMsg = e.getMessage();
				}

				return new ResponseBean(301, errMsg, null);
			}
		} else {

			return new ResponseBean(0, "登录成功", null);
		}
	}

	@RequestMapping(value = "/login", method = RequestMethod.GET)
	public String loginForm(HttpServletRequest request, Map<String, Object> map) {
		if (SecurityUtils.getSubject().isAuthenticated()) {
			return "redirect:index";
		} else {
			return "admin/login";
		}
	}

	@RequestMapping("/watercode")
	public void watercode(HttpServletRequest request, HttpServletResponse response) {

		ConfigurableCaptchaService cs = new ConfigurableCaptchaService();
		cs.setColorFactory(new SingleColorFactory(new Color(25, 60, 170)));
		cs.setBackgroundFactory(new SingleColorBackgroundFactory(new Color(236, 236, 236)));
		cs.setFilterFactory(new CurvesRippleFilterFactory(cs.getColorFactory()));

		AdaptiveRandomWordFactory wordFactory = new AdaptiveRandomWordFactory();

		wordFactory.setCharacters("123456789AX");
		wordFactory.setMinLength(4);
		wordFactory.setMaxLength(4);

		cs.setWordFactory(wordFactory);

		response.setContentType("image/jpeg");//设置相应类型,告诉浏览器输出的内容为图片
		response.setHeader("Pragma", "No-cache");//设置响应头信息，告诉浏览器不要缓存此内容
		response.setHeader("Cache-Control", "no-cache");
		response.setDateHeader("Expire", 0);

		try {
			request.getSession(true).setAttribute("code", "");
			String verfiyCode = EncoderHelper.getChallangeAndWriteImage(cs, "png", response.getOutputStream());
			request.getSession(true).setAttribute("code", verfiyCode);
			log.info(verfiyCode);
		} catch (IOException e) {
			log.error(e.getMessage(), e);
		}
	}

}
