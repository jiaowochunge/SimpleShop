/**
 *
 */
package ai.bell.shop.web.shiro;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.beans.factory.annotation.Autowired;

import ai.bell.shop.biz.service.SysUserService;
import ai.bell.shop.spi.data.SysUser;

/**
 * @author john
 *
 */
public class AdminRealm extends AuthorizingRealm {

	@Autowired
	private SysUserService userService;

	@Override
	protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
		return null;
	}

	@Override
	protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
		UsernamePasswordToken upToken = (UsernamePasswordToken) token;

		try {
			SysUser user = userService.loadUser(upToken.getUsername());

			return new SimpleAuthenticationInfo(user, user.getPassword(), getName());
		} catch (Exception e) {
			throw new AuthenticationException(e.getMessage());
		}
	}

	@Override
	public String getName() {
		return "MyRealm";
	}

}
