/**
 *
 */
package ai.bell.shop.web.ctl.admin;

import javax.validation.Validator;

import org.springframework.beans.factory.annotation.Autowired;

/**
 * @author john
 *
 */
public class BaseCtl {

	@Autowired
	protected Validator validator;

}
