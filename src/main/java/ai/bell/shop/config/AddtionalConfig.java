/**
 *
 */
package ai.bell.shop.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import com.github.wxpay.sdk.WXPay;

/**
 * @author john
 *
 */
@Configuration
public class AddtionalConfig {

	@Autowired
	private Environment environment;

	@Bean
	public WXPay wxPay(MyWXPayConfig config) throws Exception {
		if (environment.getActiveProfiles()[0].equals("dev")) {
			return new WXPay(config, true, true);
		} else {
			return new WXPay(config, true, false);
		}
	}

}
