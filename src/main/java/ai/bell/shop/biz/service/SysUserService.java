/**
 *
 */
package ai.bell.shop.biz.service;

import org.springframework.stereotype.Service;

import com.smthit.framework.dal.bettlsql.EntityManager;
import com.smthit.lang.convert.DefaultReformer2;
import com.smthit.lang.exception.ServiceException;

import ai.bell.shop.dal.entity.SysUserPO;
import ai.bell.shop.spi.data.SysUser;
import ai.bell.shop.spi.enums.EnumCommonStatus;


/**
 * @author john
 *
 */
@Service
public class SysUserService implements EntityManager<SysUserPO> {

	public SysUser loadUser(String mobile) {
		SysUserPO template = new SysUserPO();
		template.setStatus(EnumCommonStatus.NORMAL.getValue());
		template.setLoginName(mobile);

		SysUserPO user =  SysUserPO.Dao.$.templateOne(template);

		if(user != null) {
			SysUser info = new DefaultReformer2<SysUserPO, SysUser>(SysUser.class).toVO(user);

			//TODO: 加载权限

			return info;
		}

		throw new ServiceException("账户不存在.");
	}

}
