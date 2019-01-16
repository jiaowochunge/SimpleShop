/**
 *
 */
package ai.bell.shop.config;

import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.realm.Realm;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

import ai.bell.shop.web.shiro.AdminRealm;
import ai.bell.shop.web.shiro.ShiroFormAuthenticationFilter;

/**
 * @author john
 *
 */
@Configuration
public class ShiroConfig {

	@Bean
	public Realm adminRealm() {
		return new AdminRealm();
	}

	@Bean
	@DependsOn(value = "lifecycleBeanPostProcessor")
	public DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {
		DefaultAdvisorAutoProxyCreator creator = new DefaultAdvisorAutoProxyCreator();
		creator.setProxyTargetClass(true); // it's false by default
		return creator;
	}

	@Bean
	public ShiroFilterFactoryBean shiroFilterFactoryBean(SecurityManager securityManager) {
		ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();
		shiroFilterFactoryBean.setSecurityManager(securityManager);

		//权限验证
		/**
		 * https://lists.apache.org/thread.html/189e4d001236062df286d11314fb96c818e93f9d34de245265aef6f8@%3Cdev.shiro.apache.org%3E
		 * 按照官方文档，至少只需要配置2个bean就可以了。一个realm的bean，一个filterChain的bean。我们需要重写authc过滤器，
		 * 本来自定义一个filter就行了，但不知道为什么没用。所以索性重写shiroFilterFactoryBean了。
		 */
		shiroFilterFactoryBean.getFilters().put("authc", new ShiroFormAuthenticationFilter());

		Map<String, String> filterChainDefinitionMap = new LinkedHashMap<String, String>();

		// 静态资源可直接访问
		filterChainDefinitionMap.put("/static/**", "anon");
		filterChainDefinitionMap.put("/layuiadmin/**", "anon");
		filterChainDefinitionMap.put("/admin/layuiadmin/**", "anon");
		filterChainDefinitionMap.put("/watercode", "anon");
		filterChainDefinitionMap.put("/favicon.ico", "anon");

		// 后端相关访问控制
		filterChainDefinitionMap.put("/admin/logout", "logout");
		filterChainDefinitionMap.put("/admin/", "authc");
		filterChainDefinitionMap.put("/admin/**", "authc");

		shiroFilterFactoryBean.setLoginUrl("/admin/login");
		shiroFilterFactoryBean.setSuccessUrl("/admin/index");

		//未授权界面;
		shiroFilterFactoryBean.setUnauthorizedUrl("/403");
		shiroFilterFactoryBean.setFilterChainDefinitionMap(filterChainDefinitionMap);

		return shiroFilterFactoryBean;
	}

}